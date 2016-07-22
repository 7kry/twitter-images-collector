import peewee

class Tweet(peewee.Model):
  tid         = peewee.IntegerField(unique = True)
  screen_name = peewee.TextField()
  text        = peewee.TextField()
  created_at  = peewee.DateTimeField()

class Image(peewee.Model):
  tweet    = peewee.ForeignKeyField(Tweet)
  filename = peewee.TextField()
  class Meta:
    indexes = (
      (('tweet', 'filename'), True),
    )

#class Morpheme(peewee.Model):
#  tid      = peewee.ForeignKeyField(Tweet)
#  text     = peewee.TextField()
#  class Meta:
#    indexes = (
#      (('tid', 'text'), True),
#    )
