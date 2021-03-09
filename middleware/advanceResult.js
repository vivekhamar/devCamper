const advanceResult = (model, populate) => async (req, res, next) => {
    let reqQuery = { ...req.query };

    // Fields to remove from req query
    let removeFields = ['select', 'page', 'limit', 'sort'];

    // Removing the remove fields from the req query object
    removeFields.forEach(param => delete reqQuery[param]);
    
    let query = model.find(reqQuery);
    // console.log(query)
    
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields); 
    }

    if(req.query.sort){
        const field = req.query.sort.split(',').join(' ');
        query = query.sort(field);
    }
    else{
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    if(populate){
        query = query.populate(populate);
    }

    const results = await query;
    
    const pagination = {}

    if(endIndex < total){
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    res.advancedResult = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
}

module.exports = advanceResult;