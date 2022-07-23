<?php
include_once('auth.php');
include_once('csrf.php');
include_once('lib/cart.inc.php');

if (!ierg4210_auth()) {
	header('Location: login.php');
	exit();
}

// header('Access-Control-Allow-Origin: *');
// header("Access-Control-Allow-Headers: *");
// header('Access-Control-Allow-Origin: https://secure.s27.ierg4210.ie.cuhk.edu.hk');
header('Content-Type: application/json');

$action = $_REQUEST['action'];
$role = $_REQUEST['role'];
// input validation
if (empty($action) || !preg_match('/^\w+$/', $action) || empty($role)) {
	echo json_encode(array('failed' => 'undefined'));
	exit();
}

// check role for action
$isFetch = strpos($action, 'fetch');
if ($role !== 'admin' && !$isFetch) {
	echo json_encode(array('failed' => 'Unauthorized'));
	exit();
}

// verify csrf
if (!$isFetch) {
	try {
		csrf_verifyNonce($_REQUEST['action'], $_POST['nonce']);
	} catch (Exception $e) {
		echo json_encode(array('failed' => $e));
	}
}

// The following calls the appropriate function based to the request parameter $_REQUEST['action'],
//   (e.g. When $_REQUEST['action'] is 'cat_insert', the function ierg4210_cat_insert() is called)
// the return values of the functions are then encoded in JSON format and used as output
try {
	if (($returnVal = call_user_func('ierg4210_' . $action)) === false) {
		if ($db && $db->errorCode())
			error_log(print_r($db->errorInfo(), true));
		echo json_encode(array('failed' => 'Request failed'));
		return;
	}
	echo json_encode(array('success' => $returnVal));
} catch (PDOException $e) {
	// if action is fetch, return error in json
	if ($isFetch) {
		error_log($e->getMessage());
		echo json_encode(array('failed' => 'Database error'));
	} else {
		// if action is not fetch, return error in text html
		header('Content-Type: text/html; charset=utf-8');
		echo 'Database error.<br/><a href="javascript:history.back();">Back to admin panel.</a>';
	}
} catch (Exception $e) {
	// if action is fetch, return error in json
	if ($isFetch) {
		error_log($e->getMessage());
		echo json_encode(array('failed' => $e->getMessage()));
	} else {
		// if action is not fetch, return error in text html
		header('Content-Type: text/html; charset=utf-8');
		echo $e->getMessage() . '<br/><a href="javascript:history.back();">Back to admin panel.</a>';
	}
}
