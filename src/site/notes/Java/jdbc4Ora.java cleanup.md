---
dg-publish: true
permalink: /java/jdbc4-ora-java-cleanup/
hide: true
---

// Cleans up results of running jdbc4Ora.java             

```java

import java.io.*;  

import java.sql.*;  

public class jdbc6Ora {  

  public static void main(String [] aa) {  

    String url;  

    url = "jdbc:oracle:thin:@cslabdb:1525:cfedb";  

        // jdbc is 'protocol', thin is the driver  ',  

                  // and cs514 is the 'user data source'  

    Statement stmt;  

    Connection con;  

    try { // invoke oracle thin driver; register it with DriverManager  

      Class.forName("oracle.jdbc.driver.OracleDriver");  

    }  

    catch (Exception e) {  

      System.out.println("MR.UnitSitQueries.constructor.Exception: " +  

        e);  

    }  

    try {  

      con = DriverManager.getConnection(url,"eckberg","carl");  

        // establish connection to DBMS or database  

      stmt = con.createStatement(); // creates object from which SQL commands  

                // can be sent to the DBMS  

      String deleteString;  

      deleteString = "DELETE FROM empbb02  " +   

                        "WHERE ename = 'hodges'";  

      stmt.executeUpdate(deleteString);  

      stmt.close();  

      con.close();  

    }  

    catch (SQLException e){System.err.println("OOPS " + e.getMessage());}  

  }  

}