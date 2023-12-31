
function addNewExpense(e){
    e.preventDefault();

    const expenseDetails = {
        expenseamount: e.target.expenseamount.value,
        description: e.target.description.value,
        category: e.target.category.value,

    }
    console.log(expenseDetails)
    const token  = localStorage.getItem('token')
    axios.post('http://localhost:3000/expense/addexpense',expenseDetails,  { headers: {"Authorization" : token} })
        .then((response) => {

       // addNewExpensetoUI(response.data.expense);
       window.location.reload();

    }).catch(err => showError(err))

}

function showPremiumuserMessage() {
    document.getElementById('rzp-button1').style.visibility = "hidden"
    document.getElementById('message').innerHTML = " PREMIUM USER "
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', async ()=> {

    deleteChild()
    const page = 1;
    getExpenses(page);
    const token  = localStorage.getItem('token')
    const decodeToken = parseJwt(token)
   
    const ispremiumuser = decodeToken.ispremiumuser;
    if(ispremiumuser){
        showPremiumuserMessage()
        showLeaderboard()
    }
    
});

function addNewExpensetoUI(expenses){
    
    const parentElement = document.getElementById('listOfExpenses');
    deleteChild()

    expenses.forEach(expense => {

    const expenseElemId = `expense-${expense.id}`;
    parentElement.innerHTML += `
        <li id=${expenseElemId}>
            ${expense.expenseamount} - ${expense.category} - ${expense.description}
            <button onclick='deleteExpense(event, ${expense.id})'>
                Delete Expense
            </button>
        </li>`
    
})
    


}

async function deleteExpense(e, expenseid) 
{
    try
    {
        console.log(expenseid);
        const token = localStorage.getItem('token')
        const response = await axios.delete(`http://localhost:3000/expense/deleteexpense/${expenseid}`,  { headers: {"Authorization" : token} })
       
        removeExpensefromUI(expenseid);
        window.location.reload();
    }
    catch(err)
    {
        console.log(err);
    }
    
               
}

function showError(err){
    document.body.innerHTML += `<div style="color:red;"> ${err}</div>`
}
function showLeaderboard(){
   const inputElement = document.createElement("input")
    inputElement.type = "button"
    inputElement.value = 'Show Leaderboard'
    inputElement.onclick = async() => {
        const token = localStorage.getItem('token')
        const userLeaderBoardArray = await axios.get('http://localhost:3000/premium/showLeaderBoard', { headers: {"Authorization" : token} })

        var leaderboardElem = document.getElementById('leaderboard')
        //leaderboardElem.innerHTML += '<h1> Leader Board </<h1>'
        userLeaderBoardArray.data.forEach((userDetails) => {
            leaderboardElem.innerHTML += `<li>Name - ${userDetails.name} Total Expense - ${userDetails.totalExpenses || 0} </li>`
        })
    }
    document.getElementById("leaderboard").appendChild(inputElement);

}

function removeExpensefromUI(expenseid){
    const expenseElemId = `expense-${expenseid}`;
    document.getElementById(expenseElemId).remove();
}

async function razorPay(e) 
{
    const token = localStorage.getItem('token')
    const response  = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: {"Authorization" : token} });
    console.log(response);
    var options =
    {
     "key": response.data.key_id,          // Key generated from Dashboard
     "order_id": response.data.order.id,            // For one time payment
    
     "handler": async function (response) {                     // handles success of transaction
        const res = await axios.post('http://localhost:3000/purchase/updatetransactionstatus',{
             order_id: options.order_id,
             payment_id: response.razorpay_payment_id,
         }, { headers: {"Authorization" : token} })
        
        console.log(res)
         alert('You are a Premium User Now')
         localStorage.setItem('token', res.data.token)
         showPremiumuserMessage()
      
     },
  };
  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on('payment.failed', function (response){
    console.log(response)
    alert('Something went wrong')
 });
}
function download()
{
    axios.get('http://localhost:3000/user/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 200){ 
            var a = document.createElement("a");
            a.href = response.data.fileURL;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message)
        }

    })
    .catch((err) => {
        showError(err)
    });   
}


function getExpenses(page)
{
    const ul = document.getElementById('listOfExpenses');

    ul.innerHTML = '';
    deleteChild()
    const token = localStorage.getItem('token')
    axios.get(`http://localhost:3000/expense/getexpensespage/${page}`, { headers: {"Authorization" : token} })
    .then(({data:{expenses,...pageData}}) => {
        console.log(expenses)
        addNewExpensetoUI(expenses); 
        showPagination(pageData);
    })
    .catch((err) => {
        console.log(err);
    })
}
function showPagination({
    currentPage,
    hasNextPage,
    nextPage,
    hasPreviousPage,
    previousPage,
    lastPage
})
{
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    if(hasPreviousPage)
    {
        const btn2=document.createElement('button');
        btn2.innerHTML = previousPage;
        btn2.addEventListener('click',() => getExpenses(previousPage))
        pagination.appendChild(btn2);
    }
    
        const btn1=document.createElement('button');
        btn1.innerHTML = `<h3>${currentPage}</h3>`
        btn1.addEventListener('click',() => getExpenses(currentPage))
        pagination.appendChild(btn1);
    
    if(hasNextPage)
    {
        const btn3=document.createElement('button');
        btn3.innerHTML = nextPage;
        btn3.addEventListener('click',() => getExpenses(nextPage))
        pagination.appendChild(btn3);
    }

}
function deleteChild() {
    var e = document.querySelector("ul");
    
   
    var child = e.lastElementChild; 
    while (child) {
        e.removeChild(child);
        child = e.lastElementChild;
    }
}

async function daily()
{
    try
    {
    
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:3000/expense/daily', { headers: {"Authorization" : token} })
        
        monthaddNewExpense(response.data.data);
    }
    catch(err)
    {
        console.log(err);
    }
}
async function monthly()
{  
    try
    {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:3000/expense/monthly', { headers: {"Authorization" : token} })
        monthaddNewExpense(response.data.data);
    }
    catch(err)
    {
        console.log(err);
    }
}
async function yearly()
{
    try
    {
        const token = localStorage.getItem('token')
        const response = await axios.get('http://localhost:3000/expense/getexpenses', { headers: {"Authorization" : token} })
        monthaddNewExpense(response.data.expenses);
    }

    catch(err)
    {
        console.log(err);
    }
    
}
function monthaddNewExpense(expenses){
    deleteChild()
    const parentElement = document.getElementById('categorizedexpenses');
   
   expenses.forEach(expense => {
    console.log(expense);
    
    parentElement.innerHTML += `
        <li >

             ${expense.expenseamount} - ${expense.category} - ${expense.description} 
            <button onclick='deleteExpense(event, ${expense._id})'>
                Delete Expense
            </button>
        </li>`
    
})
}
function getExpenseswithoutPage()
{
    const ul = document.getElementById('listOfExpenses');

    ul.innerHTML = '';
    deleteChild()
    const token = localStorage.getItem('token')
    axios.get(`http://localhost:3000/expense/getexpenses`, { headers: {"Authorization" : token} })
    .then((expenses) => {
        console.log(expenses)
        addNewExpensetoUI(expenses); 
        
    })
    .catch((err) => {
        console.log(err);
    })
}