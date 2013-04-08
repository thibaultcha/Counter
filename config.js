/* Port the server will be listening on */
const port = 25000

/* Dir for frontend views */
const rootviews = __dirname + "/views"

/* FROM HERE: OPTIONAL CONFIG  */

/* Database host */
const host = "localhost"

/* Database name */
const database = "counter"

/* Database username */
const username = "root"

/* Database password */
const password = "root" // omg

module.exports = {
    PORT       : port,
    VIEWS      : rootviews,
    DBHOST     : host,
    DBNAME     : database,
    DBUSERNAME : username,
    DBPASSWORD : password
}