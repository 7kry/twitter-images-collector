#! /usr/bin/python3

# requirements
import bottle
import peewee
import tweepy
import yaml

# std
import datetime
import hashlib
import itertools
import os.path
import sys
import threading
import time
import urllib.request

# local
import dbsetup
models = dbsetup.models

CONF = yaml.load(open(sys.argv[1]))

def tweepy_api_init():
  ah = tweepy.OAuthHandler(CONF['consumer']['key'], CONF['consumer']['secret'])
  ah.set_access_token(CONF['access_token']['key'], CONF['access_token']['secret'])
  return tweepy.API(ah)

api = tweepy_api_init()
db  = peewee.__dict__[CONF['database']['type']](CONF['database']['path'])
dbsetup.init(db)

def fetch_tweets():
  return getattr(api, CONF['target']['type'])(**CONF['target']['args'])

def fetch_media(t):
  ret = []
  if hasattr(t, 'retweeted_status'):
    t = t.retweeted_status
  for m in itertools.chain(t.entities.get('media', []), getattr(t, 'extended_entities', {}).get('media', [])):
    try:
      with urllib.request.urlopen(m['media_url_https'] + ':orig') as res:
        cont = res.read()
    except:
      sleep(1)
    h = hashlib.md5()
    h.update(cont)
    fn = '{0}{1:02d}{2:02d}{3:02d}{4:02d}{5:02d}.{6}.{7}'.format(
        t.created_at.year,
        t.created_at.month,
        t.created_at.day,
        t.created_at.hour,
        t.created_at.minute,
        t.created_at.second,
        h.hexdigest(),
        m['media_url_https'].split('.')[-1],
      )
    dest = os.path.join(CONF['images']['savedest'], fn)
    if not os.path.exists(dest):
      with open(dest, 'wb') as f:
        f.write(cont)
    ret.append(fn)
  return set(ret)

def auth(username, password):
  return username == CONF['auth']['user'] and password == CONF['auth']['pass']

class FetchThread(threading.Thread):
  def run(self):
    while True:
      try:
        for t in fetch_tweets():
          if len(models.Tweet.select().where(models.Tweet.tid == t.id)) == 0:
            item = models.Tweet(
                tid         = t.id,
                screen_name = t.author.screen_name,
                text        = t.text if not hasattr(t, 'retweeted_status') else 'RT @{0}: {1}'.format(t.retweeted_status.author.screen_name, t.retweeted_status.text),
                created_at  = t.created_at
              )
            item.save()
            for fn in fetch_media(t):
              img = models.Image(tweet = item, filename = fn)
              img.save()
        db.commit()
        print('COMMIT')
        time.sleep(90)
      except tweepy.error.TweepError:
        time.sleep(10)

FetchThread().start()

#@bottle.route("/")
#@bottle.auth_basic(auth)
#def form():
#  return bottle.static_file("form.html", root = APP_PATH)
#
#@bottle.route("/submit", method = "POST")
#@bottle.auth_basic(auth)
#def submit():
#  try:
#    checksums = bottle.request.forms.get("checksums").split(",")
#    files     = list(map(lambda form: form[1], filter(lambda form: form[0] == "photos", bottle.request.POST.allitems())))
#    if len(checksums) != len(files):
#      raise AttributeError
#    passed = []
#    for f, s in zip(files, checksums):
#      with tempfile.TemporaryFile("w+b") as tmp:
#        f.save(tmp)
#        tmp.flush()
#        tmp.seek(0)
#        bytes_str= tmp.read()
#        h = hashlib.sha256()
#        h.update(bytes_str)
#        assert(s == "".join(map(lambda c: "%02x" % c, h.digest())))
#        passed.append(("%s.%s%s" % (datetime.date.today().strftime("%Y-%m-%d"), s, os.path.splitext(f.raw_filename)[1]), bytes_str))
#    for fn, b in passed:
#      open(os.path.join(CONTENT_PATH, fn), "wb").write(b)
#    return {
#      "urls": list(map(lambda elem: MEDIA_SERVER + elem[0], passed)),
#    }
#  except AssertionError as e:
#    return {
#      "error": "Invalid File (%s)" % e.message,
#    }
#  except AttributeError:
#    return {
#      "error": "Insufficient Request",
#    }
#
#bottle.run(host = "0.0.0.0", port = 3010)
