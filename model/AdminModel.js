const db = require('../utils/database')

module.exports = class Admin { 
  constructor(username, id, descr, sex, status, rating){
    this.username = username;
    this.id = id;
    this.descr = descr;
    this.sex = sex;
    this.status = status || 'zz';
    this.rating = rating || 0;

  }

  save() {
   try{
    db.execute('INSERT INTO user (id, username, descr, sex, status, rating) VALUES (?,?,?,?,?,?)', [ this.id, this.username, this.descr, this.sex, this.status, this.rating]);
  }catch(err){
    console.log('err@register: ' + err);
  }
  }

  static fetchById(id){
    try{
    return db.execute('SELECT * FROM user WHERE id = ? ', [id]);
  }catch(err){
    console.log('err@findById: ' + err);
  }
  }

  static fetchFirstMatch(type, sex){
    try{
      if (type === 'casual') return db.execute('SELECT * FROM user WHERE status = "looking" LIMIT 1');
      if (type === 'date') return db.execute('SELECT * FROM user WHERE sex = ? AND status = "looking" LIMIT 1', [sex]); 
    }catch(err){
      console.log('err@updateOne: ' + err);
    }
  }

  static updateOne(id, fieldName, fieldValue){
    try{
      if (fieldName === 'name') return db.execute('UPDATE user SET username = ? WHERE id = ? ', [fieldValue, id]);
      if (fieldName === 'desc') return db.execute('UPDATE user SET descr = ? WHERE id = ? ', [fieldValue, id]); 
      if (fieldName === 'status') return db.execute('UPDATE user SET status = ? WHERE id = ? ', [fieldValue, id]); 
    }catch(err){
      console.log('err@updateOne: ' + err);
    }
  }

  static getStatus(id){
    try{
      return db.execute('SELECT status FROM user WHERE id = ? ', [id]);
      }catch(err){
      console.log('err@updateOne: ' + err);
    }
  }
}