// dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');

// link to mysql
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3300,
    user: 'root',
    password: 'root',
    socketPath: /Applications/MAMP / tmp / mysql / mysql.sock,
    database: 'Bamazon'

});

// validateInput 
//isinteger :make sure the return is a intiger
function validateInput(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);

    if (integer && (sign === 1)) {
        return true;
    } else {
        return 'Please enter a number.';
    }
}


function promptUserPurchase() {

    inquirer.prompt([{
            type: 'input',
            name: 'item_id',
            message: 'Please enter the Item ID which you would like to purchase.',
            validate: validateInput,
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many do you need?',
            validate: validateInput,
            filter: Number
        }
    ]).then(function(input) {

        var item = input.item_id;
        var quantity = input.quantity;


        var queryStr = 'SELECT * FROM products WHERE ?';

        connection.query(queryStr, { item_id: item }, function(err, data) {
            if (err) throw err;



            if (data.length === 0) {
                console.log('ERROR: Invalid Item ID. Please select a valid Item ID.');
                displayInventory();

            } else {
                var productData = data[0];


                if (quantity <= productData.stock_quantity) {
                    console.log('Congratulations, the product you requested is in stock! Placing order!');


                    var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;

                    connection.query(updateQueryStr, function(err, data) {
                        if (err) throw err;

                        console.log('Your oder has been placed! Your total is $' + productData.price * quantity);
                        console.log('Thank you for shopping with us!');

                        connection.end();
                    })
                } else {
                    console.log('Sorry, there is not enough product in stock, your order can not be placed.');
                    console.log('Please modify your order.');

                    displayInventory();
                }
            }
        })
    })
}


function displayInventory() {

    queryStr = 'SELECT * FROM products';

    // Make the db query
    connection.query(queryStr, function(err, data) {
        if (err) throw err;

        console.log('Existing Inventory: ');
        console.log('...................\n');

        var str = '';
        for (var i = 0; i < data.length; i++) {
            str = '';
            str += 'Item ID: ' + data[i].item_id + '  //  ';
            str += 'Product Name: ' + data[i].product_name + '  //  ';
            str += 'Department: ' + data[i].department_name + '  //  ';
            str += 'Price: $' + data[i].price + '\n';

            console.log(str);
        }

        console.log("---------------------------------------------------------------------\n");

        promptUserPurchase();
    })
}

function runBamazon() {

    displayInventory();
}

// Run the application 
runBamazon();