var table_server	=	"CREATE TABLE IF NOT EXISTS login(" +
	  						"id			integer		primary key," + 
	  						"username 	text," + 
	  						"password 	text" +
  						")";

alert("antes de crear base");
  db = $cordovaSQLite.openDB("cfe.db");
alert("base de datos creada");
  $cordovaSQLite.execute(db,table_server);
alert("tabla creada");
	
