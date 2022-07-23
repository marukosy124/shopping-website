<?php
include_once('payments-func.php');


/********************************************************
 * handle add order from client
 ********************************************************/
if (!empty($_POST["oid"]) && empty($_POST["txn_id"])) {
  if (($result = addOrder($_POST)) !== false) {
    echo json_encode(array('success' => $result));
  } else {
    echo json_encode(array('failed' => 'Cannot add order'));
  }
  exit();
}

/********************************************************
 * handle IPN from PayPal
 ********************************************************/
$testMode = true;
$paypalUrl = 'https://www.paypal.com/cgi-bin/webscr';
if ($testMode === true)
  $paypalUrl = 'https://www.sandbox.paypal.com/cgi-bin/webscr';

$ipnResponse = ''; // holds the IPN response from paypal
$ipnData = array(); // array will contain the POST values for IPN

$urlParsed = parse_url($paypalUrl);

$req = 'cmd=_notify-validate'; // Add 'cmd' to req (ipn command)

// Read the post from PayPal system and add them to req
foreach ($_POST as $key => $value) {
  $ipnData["$key"] = $value;
  $value = urlencode(stripslashes($value));
  $req .= "&" . $key . "=" . $value;
}

// Open the connection to paypal
$fp = fsockopen($urlParsed['host'], "80", $errno, $errstr, 30);

// If could open the connection and check response
if ($fp) {

  fputs($fp, "POST " . $urlParsed['path'] . " HTTP/1.1\r\n");
  fputs($fp, "Host: " . $urlParsed['host'] . "\r\n");
  fputs($fp, "Content-type: application/x-www-form-urlencoded\r\n");
  fputs($fp, "Content-length: " . strlen($req) . "\r\n");
  fputs($fp, "Connection: close\r\n\r\n");
  fputs($fp, $req . "\r\n\r\n");

  // Loop through the response from the server and append to variable
  while (!feof($fp)) {
    $ipnResponse .= fgets($fp, 1024);
  }
  fclose($fp);

  $status = verifyTransaction($_POST);

  // Valid IPN transaction.
  if ($status == "VERIFIED") {
    $data = [
      "status" => "completed",
      "txn_id" => $ipnData["txn_id"],
      "custom_id" => $ipnData["custom"],
    ];
    if (checkTxnid($ipnData["txn_id"]) && validateTxn($ipnData)) {
      if (($result = updateOrder($data)) !== false) {
        echo json_encode(array('success' => $result));
      }
    }
    echo json_encode(array('failed' => 'Cannot update order'));
    // Some action on IPN validation - update payment status etc
    die("OK. IPN Validation: Success");
  }
  // Invalid IPN transaction
  else {
    die("ERROR. IPN Validation: Failed");
  }
}
// Else no connection, so maybe wrong url or other reasons, you can do another call later
else {
  die("ERROR. IPN Connection: fsockopen error");
}
