/* port the server will be listening on */
const port = 25000

/* dir for frontend views */
const rootviews = __dirname + "/views"


/* OPTIONAL CONFIG FROM HERE */

/* database host */
const host = "localhost"

/* database name */
const database = "solib"

/* database username */
const username = "root"

/* database password */
const password = "root" // omg

module.exports = {
    PORT       : port,
    VIEWS 	   : rootviews,
    DBHOST     : host,
    DBNAME     : database,
    DBUSERNAME : username,
    DBPASSWORD : password
}