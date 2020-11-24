import express from "express"
import bodyParser from "body-parser"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from 'uuid';
import merge from "deepmerge"

const app: express.Application = express()

app.use(bodyParser.json())

const app_root: string = process.cwd()
const data_folder: string = path.join(app_root, "/data")

interface Collection {
    [id: string]: Document
}

interface Document {
    [key: string]: [string]
}

async function CreateOrGetCollection(collection: string) {
    // Read the file from disk
    const collection_path = path.join(data_folder, `${collection}.json`)

    const exist = await fs.existsSync(collection_path)

    if (!exist) {
        fs.writeFileSync(collection_path, '{}')
    }

    // Get file content
    const file_content = await fs.readFileSync(collection_path, 'utf-8')
    const json: Collection = JSON.parse(file_content)

    return json
}

function createAvailableUUIDInCollection(collection:  Collection): string {
    const uuid: string = uuidv4()

    const filtered: Document = collection[uuid]

    if(filtered) {
        return createAvailableUUIDInCollection(collection)
    }

    return uuid
}

async function writeInCollection(collection: string, data: object): Promise<void> {
    const collection_path = path.join(data_folder, `${collection}.json`)
    return fs.writeFileSync(collection_path, JSON.stringify(data));
}


// Get collection
app.get("/collection/:collection", async    (req: express.Request, res: express.Response)=> {
    const {collection} = req.params

    // Get collection
    const data: Collection = await CreateOrGetCollection(collection)

    // Return collection information
    return res.json({_id: collection, count: Object.keys(data).length})
})

// Add new document
app.post("/collection/:collection", async (req: express.Request, res: express.Response) => {
    const  {collection} = req.params
    const body = req.body

    if (body._id) {
        return res.status(500).send("ID field is not authorized on add method !")
    }

    // Get collection data
    const collection_data: Collection = await CreateOrGetCollection(collection)

    // Get UUID
    const uuid: string = createAvailableUUIDInCollection(collection_data)

    // Build new object
    collection_data[uuid] = body

    // Write new data
    await writeInCollection(collection, collection_data)

    return res.json({_id:uuid, ...collection_data[uuid]})
})

// Delete a collection
app.delete("/collection/:collection", async(req: express.Request, res: express.Response)=>{
    const  {collection} = req.params

    // Read the file from disk
    const collection_path = path.join(data_folder, `${collection}.json`)

    const exist = await fs.existsSync(collection_path)

    if (!exist) {
        res.status(404).send("Collection not found !")
    }

    // Delete file
    await fs.unlinkSync(collection_path)

    return res.send("Success")
})

// Get document
app.get("/collection/:collection/document/:document", async (req: express.Request, res: express.Response) => {
    const {collection, document} = req.params

    // Get collection
    const collection_data:Collection = await CreateOrGetCollection(collection)

    // Filter collection
    const filtered: Document = collection_data[document]

    // Check if document exist
    if (filtered === undefined) {
        return res.status(404).send("Document not found !")
    }

    // Return document
    return res.json({_id: document, ...filtered})
})

// Set a document
app.post("/collection/:collection/document/:document", async (req: express.Request, res: express.Response) => {
    const {collection, document} = req.params
    const body = req.body

    // Check if ID is not in body
    if (body._id) {
        return res.status(500).send("ID field is not authorized in the body !")
    }

    // Get collection
    const collection_data: Collection = await CreateOrGetCollection(collection)

    // Filter collection
    let filtered: Document = collection_data[document]

    // Set default value if undefined
    if (filtered === undefined) {
        filtered = {}
    }

    // Merge collection
    collection_data[document] = merge(filtered, body)

    // Write change in DB
    await writeInCollection(collection, collection_data)

    // Return new data
    return res.json({_id: document, ...collection_data[document]})
})

// Delete document from collection
app.delete("/collection/:collection/document/:document", async (req: express.Request, res: express.Response) => {
    const {collection, document} = req.params

    // Get collection
    const collection_data:Collection = await CreateOrGetCollection(collection)

    // Filter collection
    const filtered: Document = collection_data[document]

    if(filtered === undefined) {
        res.status(404).send("Document not found !")
    }

    // Remove document
    delete collection_data[document]

    // Write change in DB
    await writeInCollection(collection, collection_data)

    res.send("Success")
})

// Check if data folder is created
const exist = fs.existsSync(data_folder)

if (!exist) {fs.mkdirSync(data_folder)}


// Listen server
app.listen(5000, () => {
    console.log("Server started on port 5000!")
})