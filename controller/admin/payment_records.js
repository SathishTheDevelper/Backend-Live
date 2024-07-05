const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");
const { record_payment } = require("../../utils/schemaMaster");
const { success } = require("../../utils/response");
const crud_service = require("../../utils/crud_service");
const validateId = require('../../utils/validateId');
const { authAdmin } = require('../../middlewares/authMiddlewares');
const multer = require('multer')
const upload = multer({limits:{fieldSize:25*1024*1024}})
const crud = new crud_service();

const methods ={authAdmin}

//Create Invoice
methods.add =asyncHandler(async (req, res) => {

    const postData = req.body;

    try {
        success(res, 201, true, "Create Successfully", await crud.insertOne(record_payment, postData));
    } catch (err) {
        throw new Error(err);
    }
})
router.post('/',upload.any(),methods.add)

//Edit Invoice
methods.edit =asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(record_payment,id,{},{});

    let dataBody = req.body

    if (!check) throw new Error('Data not Found!')
    try {
        success(res, 200, true, 'Update Successfully', await crud.updateById(record_payment, id, dataBody, { new: true }));
    } catch (err) {
        throw new Error(err);
    } 
})  
router.put('/:id',upload.any(),methods.edit )

//Get All - Invoices
methods.getAll=asyncHandler(async (req, res) => {
    try {
        success(res, 200, true, "Get Successfully", await crud.getDocument(record_payment, {...req.query},{},{}));
    } catch (err) {
        throw new Error(err);
    }
})
router.get('/',methods.getAll );
  
//Get By ID - Invoice
methods.getOne=asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(record_payment, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
        success(res, 200, true, "Get Successfully", await crud.getOneDocumentById(record_payment, id,{},{}));
    } catch (err) {
        throw new Error(err);
    }
})
router.get('/:id', methods.getOne)

//Delete Invoice
.delete('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateId(id);
    const check = await crud.getOneDocumentById(record_payment, id, {}, {});
    if(!check) throw new Error('Data not Found!')
    try {
      success(res, 200, true, "Delete Successfully", await crud.deleteById(record_payment, id));
    } catch (err) {
      throw new Error(err);
    } 
}))

module.exports = router;