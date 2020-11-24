# Clerk DB (WIP)
Clerk is a NoSQL database written in NodeJS. Clerk can be called via an Rest API.

##### Get a collection or create it

---
`GET http://localhost:5000/collection/:collectionID`
```JSON
Response:
{
    "_id": "collectionID",
    "count": 2
}
```
##### Add a document in collection

---
`POST http://localhost:5000/collection/:collectionID`
```JSON
Request :
{
    "key": "value",
    "nested": {
      "key": "value"
    }
}
Response : 
{
    "_id": "416c9753-83e3-4332-b5cf-a16539e9eddd",
    "key": "value",
    "nested": {
      "key": "value"
    }
}
```
##### Delete a collection

---
`DELETE http://localhost:5000/collection/:collectionID`
```JSON
Success
```

##### Get document in collection

---
`GET http://localhost:5000/collection/collectionID/document/documentID`
```JSON
Response : 
{
    "_id": "documentID",
    "key": "value",
    "nested": {
      "key": "value"
    }
}
```
##### Set or create a document in collection

---
`POST http://localhost:5000/collection/collectionID/document/documentID`
```JSON
Request :
{
    "key": "value",
    "nested": {
      "key": "value"
    }
}
Response : 
{
    "_id": "documentID",
    "key": "value",
    "nested": {
      "key": "value"
    }
}
```
##### Delete a document in collection

---
`DELETE http://localhost:5000/collection/collectionID/document/documentID`
```JSON
Success
```