#! /usr/bin/python3

import dbsetup.models as models
import sys

def init(db):
  tables = list(map(models.__dict__.get, filter(lambda key: key[0].isupper(), models.__dict__)))
  for t in tables:
    t._meta.database = db
  db.create_tables(tables, True)
  db.commit()
  print('COMMIT', file = sys.stderr)
