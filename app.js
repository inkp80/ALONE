var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var routes = require('./routes/index');
var users = require('./routes/users');
var mysql = require('mysql');
var fs = require('fs');
var app = express();
app.set('port', process.env.PORT || 8080); // port number setting
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var config={
	host:"localhost",
	port:"3306",
	user:"root",
	password:"root",
	database:"test"
};

var conn = mysql.createConnection(config);


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', routes);
app.use('/users', users);

app.get('/profileImg', function(req,res){
    var id = req.query.id;
    console.log(id);
    fs.readFile(id, function(error, data){
	res.writeHead(200, {'Content-Type': 'image/jpeg'});
	res.end(data);
    });
});

app.get('/login', function(req, res){
	res.end("End");
});

app.get('/magazine', function(req,res){
	conn.query("select * from magazine", function(err,rows){
 		if(err) console.log(err);
		res.contentType('application/json');
		res.write("{\"userList\":");
		res.write(JSON.stringify(rows));
		res.write("}");
		res.send();
	});
});

app.get('/mission', function(req,res){
        conn.query("select * from mission", function(err,rows){
                if(err) console.log(err);
                res.contentType('application/json');
                res.write("{\"missionList\":");
                res.write(JSON.stringify(rows));
                res.write("}");
                res.send();
        });
});

app.post('/mission', function(req,res){
var upfile = req.files.upfile;
var uuid = req.body.uuid;
var content = req.body.content;
var title = req.body.title;
var imageName;

    if(upfile.originalFilename == ''){
    res.json({result: 'No File'});
    console.log("no image");
    }else{
    console.log("yes image");
    var userfolder = path.resolve(__dirname, '..', 'misImg');
    console.log('users folder', userfolder);

    console.log(fs.existsSync(userfolder)+'');
    if(!fs.existsSync(userfolder)){
        fs.mkdirSync(userfolder);
        console.log("make profile folder");
    }else{
        console.log("Exist folder");
    }   

    console.log("read name");
    var name = upfile.name;
    console.log("name = "+name);
    console.log("read srcpath");
    var srcpath = upfile.path;
    var destpath = path.resolve(userfolder, name);
    console.log('destpath', destpath);
    
    var is = fs.createReadStream(srcpath);
    var os = fs.createWriteStream(destpath);
    
    is.pipe(os);
    is.on('end', function(){
        fs.unlinkSync(srcpath);
        var srcimg = destpath;
        var idx = destpath.lastIndexOf('.');
        var filename = destpath.substring(0,idx);
        var ext = destpath.substring(idx);
        var destimg = filename+'-thumbnail' + ext;
    
        console.log('==============');
        console.log('filename',filename);
        console.log('idx', idx);
        console.log('ext', ext);
        console.log('destimg', destimg);

	imageName = "http://52.79.98.59:8330/misImg?id="+name;
        console.log(imageName);

	var sql = "insert into mission (uuid, title, content, imgurl) values('"+uuid+"','"+title+"','"+content+"','"+imageName+"')";
	conn.query(sql, function(err){
		if(err) console.log(err);
		res.end("ok");
	});
   });
}
});

app.get('/weekmission', function(req,res){
	conn.query("select * from weeklyMission", function(err,rows){
		if(err) console.log(err);
                res.contentType('application/json');
                res.write("{\"missionList\":");
                res.write(JSON.stringify(rows));
                res.write("}");
                res.send();
        });
})


http.createServer(app).listen(app.get('port'), function(){
	console.log("Server is Running! 8330");
});

app.post("/postmagazine",function(req,res){
	//var amagnum=req.body.amagnum;
	var auuid=req.body.auuid;
	var aimgurl=req.body.aimgurl;
	var atitle=req.body.atitle;
	var acontent=req.body.acontent;
	var aauthname=req.body.aauthname;
	var ahashtag=req.body.ahashtag;
	ahashtag=ahashtag.replace(" " ,"");
	conn.query("insert into magazine (uuid,imgurl,title,content,authname,hashtag) values("+auuid+",\""+aimgurl+"\",\""+atitle+"\",\""+acontent+"\",\""+aauthname+"\",\""+ahashtag+"\");", function(err){
if(err){
	console.log(err);
	res.contentType('application/json');
	res.write("{\"result\":\"fail\"}");
	res.end();
}
else{
	res.contentType('application\json');
	res.write("{\"result\":\"success\"}");
	res.end();
	console.log("add user success");
}
});
});

app.post("/postmission",function(req,res){
	var auuid=req.body.auuid;
	var aimgurl=req.body.aimgurl;
	var alikeNum=req.body.alikeNum;

	conn.query("insert into mission (likenum,uuid,imgurl,title,content) values (\""+auuid+"\",\""+aimgurl+"\",\""+atitle+"\", \""+acontent+"\",\""+alikeNum+"\");", function(err){
if(err){
            console.log(err);
            res.contentType('application/json');
            res.write("{\"result\":\"fail\"}");
            res.end();
}
else{
            res.contentType('application/json');
            res.write("{\"result\":\"success\"}");
            res.end();
            console.log("add user success");
        }
});
});

app.post("/search", function(req,res){
//app.get("/search", function(req,res){	
	

	var searchString=req.body.searchString;
	searchString = searchString.replace(' ','');
//	var sql ="";
//	conn.query(sql, function
	conn.query("SELECT * FROM magazine WHERE hashtag LIKE '%"+searchString+"%';", function(err,rows){
						
	//searchString에 대한 처리
                if(err) console.log(err);
                res.contentType('application/json');
                res.write("{\"userList\":");
                res.write(JSON.stringify(rows));
                res.write("}"); 
                res.send();
        });
});

app.get("/comment" ,function(req,res){
	var idx=req.body.idx;        
	conn.query("select * FROM comment WHERE missionNumber=" +idx, function(err,rows){
               if(err) console.log(err);
                res.contentType('application/json');
                res.write("{\"userList\":");
                res.write(JSON.stringify(rows));
                res.write("}"); 
                res.send();
        });
});

app.post("/addcomment", function(req,res){
	var uid=req.body.uid;
	var content=req.body.content;
	var missionNumber=req.body.missionNumber;

	var sql="insert into magazine (uuid,imgurl,title,content,authname,hashtag) values(\""+auuid+"\",\""+aimgurl+"\",\""+atitle+"\",\""+acontent+"\",\""+aauthname+"\",\""+ahashtag+"\");"
	conn(sql, function(err){
	if(err){
        console.log(err);
        res.contentType('application/json');
        res.write("{\"result\":\"fail\"}");
        res.end();
	}
	else{
        res.contentType('application\json');
        res.write("{\"result\":\"success\"}");
        res.end();
        console.log("add user success");
	}	
});
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
