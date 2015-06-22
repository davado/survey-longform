<?php
/*
 * Save JSON file.
 * Create Tables and Save Responses
 */

// read json file.

function getManifest($path) {

  $jsonFile = file_get_contents($path);

  if ($jsonFile === FALSE ) {

    throw new Exception("File source unavailable.");
    return FALSE;
    
  } else {

    $jsonArray = json_decode($jsonFile, true);

    if ( $jsonArray === NULL ) {

      throw new Exception("File format error. Exiting.");
      return FALSE;
      
    } else {
      
      echo "<p>".$jsonArray['title'] . "</p>\n";
      return $jsonArray;
    }
  }
  
}

try {
  
  $survey = getManifest("./assets/data/survey-data.json");
  
  if ($survey !== FALSE) {

   $db = dbLogin();

    try {
      $statement = getData($db); 
/*
      echo "<pre>";
      var_dump( $statement );
      echo "</pre>";
*/
      if($statement) {
        printStatement($statement);
      } else {
        echo "no Statement";
      }

    } catch( PDOException $e ) {
      echo "PDO Exception: ", $e->getMessage(), "\n";
    }

  }

} catch(Exception $e) {

  echo "Caught Exception: ", $e->getMessage(), "\n";

}

// login to database
function dbLogin() {
  $host = "localhost";
  $charset = "utf8";
  $db_name = "dhmw_surveys";
  $user = "dhmw_surveys";
  $pass = "rUycycVpTCbzmEzw";
  
  $db = new PDO("mysql:host=$host;dbname=$db_name;charset=$charset", $user, $pass );
  return $db;
}

function getData($database) {
  $select = "SELECT Points.Name, Points.Title, Responses.Text, Responses.Value, count(Responses.Value) AS freq FROM Responses INNER JOIN Points INNER JOIN Surveys ON Responses.Point_ID = Points.ID AND Surveys.ID = Points.Survey_ID GROUP BY Responses.Point_ID";
  $statement = $database->prepare( $select );
    //"
  $statement->execute();
  //  $statement = $database->query("SELECT * FROM table");
  return $statement->fetchAll(PDO::FETCH_GROUP|PDO::FETCH_ASSOC);
}

  
 

function printStatement($stmt) {

  if( !  $stmt ) {
    echo "No Results";
  }
  
  $cells = "";
  $rows = ""; 
  $headers = ""; $thead = "";
  function wrapRows($row, $head = FALSE) {
    if ($head === FALSE) {
      return '<tr>'.$row.'</tr>';
    } else {
      return '<thead><tr>'.$row.'</tr></thead>';
    }
  }
  
  function wraptBody($rows) {
    return '<tbody>'.$rows.'</tbody>';
  }
  
  function wrapTable($rows) {
    return '<table>'.$rows.'</table>';
  }
  
  function buildCells($data) {
    $row = '<td>'.$data.'</td>';
    return $row;
  }
  
  function wrapElement($tag, $elements) {
    return '<'.$tag.'>'.$elements.'</'.$tag.'>';
  }
  
  function unpacka($element) {
    // echo "\n". gettype($element)."\n";
    
    if ( is_array($element) ) {
      
      foreach( $element as $key => $value ) {
        echo "<b>$key</b><br />\n";
        if(is_array($value)) {
          // echo "\$value is ARRAY\n";
        }
        unpacka( $value );
      }
      
    } elseif ( is_string($element) ) {
      
      echo $element."<br />\n";
    
    } elseif ( is_numeric($element) ) {
      
      echo '<i>'.$element."</i><br/>\n";
    
    } elseif( $element == NULL ) {
      echo "****<br/>";
     // echo "not unpacked";
    
    }
  }

  
  if($stmt) {
    echo "<pre>";
    var_dump($stmt);
    echo "</pre><br />";
    
    $json_str = json_encode($stmt);
    echo $json_str ."<br />";
    
    unpacka($stmt);
   
       
  }
  
}


// select database
// make table name from json file.
// if ( no table name ), create table
// if ( no table name ) add rows per json file


// echo table
  
?>