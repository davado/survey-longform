<?php
/*
 * Save JSON file.
 * Create Tables and Save Responses
 */

// read json file.
?>
<!DOCTYPE html>
<html>
<head>
    <style>
    strong { color: red; }
    em {font-variant: italic;}
    </style>
</head>
<body></body>
</html>

<?php
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
//Surveys.Name AS Survey, Surveys.Version AS Version,
function getData($database) {
  $select = "SELECT Points.Title AS Question, Responses.Value AS Score, count(*) AS Count FROM Responses INNER JOIN Points INNER JOIN Surveys ON Surveys.ID = Points.Survey_ID WHERE Points.Type='scale' AND Responses.Point_ID = Points.ID AND  Surveys.Version = '0.1.0' GROUP BY Score";
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
  $headers = ""; 
  $thead = "";
  
  function wrapElement($tag, $elements) {
    return '<'.$tag.'>'.$elements.'</'.$tag.'>';
  }
  
  function unpacka($element) {
    // echo "\n". gettype($element)."\n";
    
    if ( is_array($element) ) {
      
      foreach( $element as $key => $value ) {
        echo "<strong>$key</strong><br />\n";
        if(is_array($value)) {
          // echo "\$value is ARRAY\n";
        }
        unpacka( $value );
      }
      
    } elseif ( is_string($element) ) {
      
      echo $element."<br />\n";
    
    } elseif ( is_numeric($element) ) {
      
      echo '<em>'.$element."</em><br/>\n";
    
    } elseif( $element == NULL ) {
      echo "****<br/>";
     // echo "not unpacked";
    
    }
  }

  
  if($stmt) {

/*
    echo "<pre>";
    var_dump($stmt);
    echo "</pre><br />";
*/
    
/*
    $json_str = json_encode($stmt);
    echo $json_str ."<br />";
*/

    unpacka($stmt);
   
       
  }
  
}


// select database
// make table name from json file.
// if ( no table name ), create table
// if ( no table name ) add rows per json file


// echo table
  
?>