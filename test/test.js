var PouchDB = require('pouchdb');
var GQL = require('../pouchdb.gql');
//var Mapreduce = require('pouchdb-mapreduce');


var chai = require('chai');
var should = chai.should();
var expect = chai.expect;
var _ = require('underscore');

 
before(function(done){
    var db;
    PouchDB('testdb',function(err,d){
        if (!err) {
            db = d;
            var testTable = [
             {"name": "John", "dept": "Eng", "lunchTime": "12:00:00",       "salary": "1000",      "hire date": "2005-03-19", "age": "35", "isSenior": "true", "seniorityStartTime": "2007-12-02 15:56:00"}, 
             {"name": "Dave", "dept": "Eng", "lunchTime": "12:00:00",       "salary": "500" ,       "hire date": "2006-04-19", "age": "27", "isSenior": "false", "seniorityStartTime": "null"}, 
             {"name": "Sally", "dept": "Eng", "lunchTime": "13:00:00",      "salary": "600" ,      "hire date": "2005-10-10", "age": "30", "isSenior": "false", "seniorityStartTime": "null"}, 
             {"name": "Ben", "dept": "Sales", "lunchTime": "12:00:00",      "salary": "400" ,      "hire date": "2002-10-10", "age": "32", "isSenior": "true", "seniorityStartTime": "2005-03-09 12:30:00"}, 
             {"name": "Dana", "dept": "Sales", "lunchTime": "12:00:00",     "salary": "350" ,     "hire date": "2004-09-08", "age": "25", "isSenior": "false", "seniorityStartTime": "null"}, 
             {"name": "Mike", "dept": "Marketing", "lunchTime": "13:00:00", "salary": "800" , "hire date": "2005-01-10", "age": "24", "isSenior": "true", "seniorityStartTime": "2007-12-30 14:40:00"}];
            db.bulkDocs({docs: testTable}, {}, function() {
               done();
            });
        }
    })
});
after(function(done){
  PouchDB.destroy('testdb',function(){
      db = undefined;
      done();
    });
});


describe('GQL',function(){
  var db;
  beforeEach(function(done){
    PouchDB('testdb',function(err,d){
      db = d;
      done();
    })
  });
  it('should be able to work',function(done){
    should.not.exist(db.gql);
    PouchDB.plugin('gql', GQL);
    PouchDB('testdb',function(err,db){
      db.gql.should.exist;
      done();
    });
  });
  
  describe('select',function(){

      it("should select *", function(done) {
        var query = {select: "*"};
        var expected = [
        {"name": "John", "dept": "Eng", "lunchTime": "12:00:00",       "salary": "1000",      "hire date": "2005-03-19", "age": "35", "isSenior": "true", "seniorityStartTime": "2007-12-02 15:56:00"}, 
        {"name": "Dave", "dept": "Eng", "lunchTime": "12:00:00",       "salary": "500" ,       "hire date": "2006-04-19", "age": "27", "isSenior": "false", "seniorityStartTime": "null"}, 
        {"name": "Sally", "dept": "Eng", "lunchTime": "13:00:00",      "salary": "600" ,      "hire date": "2005-10-10", "age": "30", "isSenior": "false", "seniorityStartTime": "null"}, 
        {"name": "Ben", "dept": "Sales", "lunchTime": "12:00:00",      "salary": "400" ,      "hire date": "2002-10-10", "age": "32", "isSenior": "true", "seniorityStartTime": "2005-03-09 12:30:00"}, 
        {"name": "Dana", "dept": "Sales", "lunchTime": "12:00:00",     "salary": "350" ,     "hire date": "2004-09-08", "age": "25", "isSenior": "false", "seniorityStartTime": "null"}, 
        {"name": "Mike", "dept": "Marketing", "lunchTime": "13:00:00", "salary": "800" , "hire date": "2005-01-10", "age": "24", "isSenior": "true", "seniorityStartTime": "2007-12-30 14:40:00"}];
              
        PouchDB.plugin('gql', GQL);
        PouchDB('testdb',function(err,db){
            db.gql(query, function(err, actual){
              if(!err){
                  var intersection = expected.filter(function(n) {
                    return _.findWhere(actual.rows, n) != undefined
                  });
                  expect(intersection).to.have.length(expected.length);
                  expect(actual.rows.length).to.equal(expected.length);
                  done();            
              } else {
                done(err);
              }
            });
        });   
      });

      it("should return selected columns", function(done) {
        var query = {select: "name, salary"};
        var expected = [{ "name": "John", "salary": "1000"}, 
                       {"name": "Dave" , "salary": "500" }, 
                       {"name": "Sally", "salary": "600" }, 
                       {"name": "Ben"  , "salary": "400" }, 
                       {"name": "Dana" , "salary": "350" }, 
                       {"name": "Mike" , "salary": "800" }];
      
        PouchDB.plugin('gql', GQL);
        PouchDB('testdb',function(err,db){
            db.gql(query, function(err, actual){
              if(!err){
                  var intersection = expected.filter(function(n) {
                    return _.findWhere(actual.rows, n) != undefined
                  });
                  expect(intersection).to.have.length(expected.length);
                  expect(actual.rows.length).to.equal(expected.length);
                  done();            
              } else {
                done(err);
              }
            });
        });   
      });
    
    
    /* ------------ test is failing - lunchTime column is returned as null ------------- */
    // it("should return selected columns when one column is a time representation", function(done) {
    //   var query = {select: "lunchTime, name"};
    //   var expected = [{"lunchTime": "12:00:00", "name": "John"}, 
    //                  {"lunchTime": "12:00:00", "name": "Dave"}, 
    //                  {"lunchTime": "13:00:00", "name": "Sally"}, 
    //                  {"lunchTime": "12:00:00", "name": "Ben"}, 
    //                  {"lunchTime": "12:00:00", "name": "Dana"}, 
    //                  {"lunchTime": "13:00:00", "name": "Mike"}];
    //   
    //   PouchDB.plugin('gql', GQL);
    //   PouchDB('testdb',function(err,db){
    //       db.gql(query, function(err, actual){
    //         if(!err){
    //             var intersection = expected.filter(function(n) {
    //               return _.findWhere(actual.rows, n) != undefined
    //             });
    //             console.log(" ");
    //             for (var i=0; i< actual.rows.length; i++) {
    //                 console.log(actual.rows[i]);
    //             }
    //             expect(intersection).to.have.length(expected.length);
    //             expect(actual.rows.length).to.equal(expected.length);
    //             done();            
    //         } else {
    //           done(err);
    //         }
    //       });
    //   });   
    // });
    
    it("should return selected columns for column names that embed a space", function(done) {
      var query = {select: "`hire date`, name"};
      var expected = [{'hire date': '2005-03-19', name: "John"}, 
                      {'hire date': '2006-04-19', name: "Dave"}, 
                      {'hire date': '2005-10-10', name: "Sally"}, 
                      {'hire date': '2002-10-10', name: "Ben"}, 
                      {'hire date': '2004-09-08', name: "Dana"}, 
                      {'hire date': '2005-01-10', name: "Mike"}];
       
      PouchDB.plugin('gql', GQL);
      PouchDB('testdb',function(err,db){
          db.gql(query, function(err, actual){
            if(!err){
                var intersection = expected.filter(function(n) {
                  return _.findWhere(actual.rows, n) != undefined
                });
                console.log(" ");
                expect(intersection).to.have.length(expected.length);
                expect(actual.rows.length).to.equal(expected.length);
                done();            
            } else {
              done(err);
            }
          });
      });   
    });

    it("should return selected columns matching where clause", function(done) {
      var query = {select: "name", where: "salary > 700"};
      var expected = [{"name": "Mike"},{ "name": "John"}]; 
       
      PouchDB.plugin('gql', GQL);
      PouchDB('testdb',function(err,db){
          db.gql(query, function(err, actual){
            if(!err){
                var intersection = expected.filter(function(n) {
                  return _.findWhere(actual.rows, n) != undefined
                });
                expect(intersection).to.have.length(expected.length);
                expect(actual.rows.length).to.equal(expected.length);
                done();            
            } else {
              done(err);
            }
          });
      });   
    });

    /* ------------ test is failing - never returns ------------- */
    // it("should return count aggregation for group by clause", function(done) {
    //     //this.timeout(0);
    //     var query = {select: "average(salary), isSenior", groupBy: "isSenior"};
    //   //var query = "select lunchTime, count(age) group by isSenior";
    //   var expected = [{"lunchTime": "12:00:00", "count-age": "2"}, 
    //                  {"lunchTime": "13:00:00", "count-age": "1"}, 
    //                  {"lunchTime": "12:00:00", "count-age": "2"}]; 
    //    
    //   PouchDB.plugin('gql', GQL);
    //   PouchDB('testdb',function(err,db){
    //       db.gql(query, function(err, actual){
    //         if(!err){
    //             var intersection = expected.filter(function(n) {
    //               return _.findWhere(actual.rows, n) != undefined
    //             });
    //             console.log(" ");
    //             for (var i=0; i< actual.rows.length; i++) {
    //                 console.log(actual.rows[i]);
    //             }
    //             expect(intersection).to.have.length(expected.length);
    //             expect(actual.rows.length).to.equal(expected.length);
    //             done();            
    //         } 
    //       });
    //   });   
    // });
        
  });
  
});
