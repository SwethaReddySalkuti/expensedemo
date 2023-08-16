const Expense = require('../models/expense');

const ITEMS_PER_PAGE = 2;

const addexpense =  (req, res) => {
    
        
        const { expenseamount, description, category } = req.body;

        if(expenseamount == undefined || expenseamount.length === 0 ){
            return res.status(400).json({success: false, message: 'Parameters missing'})
        }
        const expense = new Expense({
            expenseamount : expenseamount,
            description: description,
            category : category,
            userId : req.user.id
        })
        expense
        .save()
        .then( result => {
            console.log(result);
            return res.status(201).json({expense, success: true } );
        })
        .catch(err => {
            return res.status(500).json({success : false, error: err})
        })  
   
}

const getexpenses = (req, res)=> {
    
    Expense.find({
        userId : req.user.id
    })
    //.select('title price -_id')          including title and price and exclude id because it is default
    //.populate('userId')         can get entire info of user from user document

    .then(expenses => {
        
        return res.status(200).json({expenses, success: true})
    })
    .catch(err => {
        console.log(err)
        return res.status(500).json({ error: err, success: false})
    })
}



const deleteexpense = async (req, res) => {
    
        const expenseid = req.params.expenseid;
        console.log(expenseid);
        if(expenseid == undefined || expenseid.length === 0){
            return res.status(400).json({success: false, })
        }
        Expense.findByIdAndRemove(expenseid)
    .then(() => {
      console.log('Deleted Expense');
      return res.status(200).json({ success: true, message: "Deleted Successfuly"})
    })
    .catch(err => {
        console.log(err);
        return res.status(500).json({ success: true, message: "Failed"})
    });        
    
    
    
}

const getexpensespage = async (req,res,next) => {
    try
    {
   /* const page= req.params.page;

    const total = await Expense.count({ where : { userId: req.user.id}})
    const totalExpensesCount = total;
    const expenses = await Expense.findAll(
            { 
                where : { userId: req.user.id},
                offset:(page-1)*ITEMS_PER_PAGE,
                limit:2
            })
        
        return res.status(200).json({
            expenses : expenses,
            currentPage:page,
            hasNextPage:ITEMS_PER_PAGE*page<totalExpensesCount,
            nextPage:Number(page)+1,
            hasPreviousPage:page>1,
            previousPage:Number(page)-1,
            lastPage:Math.ceil(totalExpensesCount/ITEMS_PER_PAGE)
        })
    
    */
    }
    catch(err)
    {
        return res.status(500).json({success : false, error: err})
        console.log(err);
    }
}

const downloadexpenses =  async (req, res) => {

    try
    {
        const expenses = await req.user.getExpenses();
        const userId = req.user.id;
        const stringifiedExpenses = JSON.stringify(expenses);  //bcz we can write only a string to a file but not array
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileURL = await uploadToS3(stringifiedExpenses,filename);
        res.status(200).json({fileURL,success:true,err:null})
    }
    catch(err)
    {
        res.status(500).json({fileURL:'',success:false,err:err})
    }
        

}

function uploadToS3(data,filename)
{

    const BUCKET_NAME = '';
    const IAM_USER_KEY = '';
    const IAM_USER_SECRET = '';
    
    let s3bucket = new AWS.S3({
        accessKeyId : IAM_USER_KEY,
        secretAccessKey : IAM_USER_SECRET
    })

    
        var params = {
            Bucket : BUCKET_NAME,
            Key : filename,
            Body : data,
            ACL : 'public-read'
        }
        return new Promise((resolve,reject) => {
            s3bucket.upload(params,(err, s3response) => {
                if(err)
                {
                    console.log('Something went wrong',err);
                    reject(err);
                }
                else
                {
                    console.log('success',s3response);
                    resolve(s3response.Location);
                }
            })
        })
        
    

}

const monthly = async (req, res)=> {
    
    
}
const yearly = async (req, res)=> {
    
   
}

const daily = async (req, res)=> {
    
    
}


module.exports = {
    deleteexpense,
    getexpenses,
    addexpense,
    downloadexpenses,
    getexpensespage,
    monthly,
    yearly,
    daily
}

