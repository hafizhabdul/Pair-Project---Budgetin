const {UserProfile, User, Transaction, Category, UserCategory} =require('../models')
class Controller{
    static async home(req,res){
        try {
            let data = await Transaction.findAll()
            res.render('home.ejs', {data})
        } catch (error) {
            res.send(error)
        }
    }

}

module.exports = Controller