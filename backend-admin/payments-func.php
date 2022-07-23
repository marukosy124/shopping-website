<?php
require 'vendor/autoload.php';
include_once('lib/db.inc.php');
$dotenv = Dotenv\Dotenv::createMutable('/var/www/html/');
$dotenv->load();

function checkTxnid($txn_id)
{
    global $db;
    $db = ierg4210_DB();
    $txn_id = addslashes($txn_id);
    $q = $db->prepare("SELECT * FROM orders WHERE txn_id = ?");
    $q->execute(array($txn_id));
    $result = $q->fetch();
    return !$result;
}

function validateTxn($data)
{
    $receiver_email = $_ENV['RECEIVER_EMAIL'];
    global $db;
    $db = ierg4210_DB();
    $custom_id = addslashes($data["custom"]);
    $q = $db->prepare("SELECT * FROM orders WHERE custom_id = ?");
    $q->execute(array($custom_id));
    $result = $q->fetch();
    if (!$result) {
        return false;
    }
    if ($data["payment_status"] !== "Completed"  || (float)$result["total"] !== (float)$data["mc_gross"] || $result["currency"] !== $data["mc_currency"] || $data["receiver_email"] !== $receiver_email || $data["txn_type"] !== "cart") {
        return false;
    }
    foreach ($data as $key => $value) {
        if (strpos($key, 'mc_gross_')) {
            $index = substr($key, 9);
            if ($result["products"][$index]["price"] != $value) {
                return false;
            }
        }
        if (strpos($key, 'quantity')) {
            $index = substr($key, 8);
            if ($result["products"][$index]["quantity"] != $value) {
                return false;
            }
        }
    }
    return true;
}

function addOrder($data)
{
    global $db;
    $db = ierg4210_DB();
    if (is_array($data)) {
        if (isset($data['guest_token'])) {
            $sql = "INSERT INTO orders (oid, custom_id, status, currency, buyer, guest_token, products, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $q = $db->prepare($sql);
            $result = $q->execute(array($data['oid'], $data['custom_id'], $data['status'], $data['currency'], $data['buyer'], $data['guest_token'], $data['products'], $data['total'], date('Y-m-d H:i:s')));
        } else {
            $sql = "INSERT INTO orders (oid, custom_id, status, currency, buyer, products, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $q = $db->prepare($sql);
            $result = $q->execute(array($data['oid'], $data['custom_id'], $data['status'], $data['currency'], $data['buyer'], $data['products'], $data['total'], date('Y-m-d H:i:s')));
        }
        if ($result) {
            return $data['oid'];
        }
    }
    return false;
}

function updateOrder($data)
{
    global $db;
    $db = ierg4210_DB();
    if (is_array($data)) {
        $sql = "UPDATE orders SET status = ?, txn_id = ? WHERE custom_id = ?";
        $q = $db->prepare($sql);
        $result = $q->execute(array($data['status'], $data['txn_id'], $data['custom_id']));
        if ($result) {
            return $data['oid'];
        }
    }
    return false;
}


function verifyTransaction($data)
{
    global $paypalUrl;

    $req = 'cmd=_notify-validate';
    foreach ($data as $key => $value) {
        $value = urlencode(stripslashes($value));
        $value = preg_replace('/(.*[^%^0^D])(%0A)(.*)/i', '${1}%0D%0A${3}', $value); // IPN fix
        $req .= "&$key=$value";
    }

    $ch = curl_init($paypalUrl);
    curl_setopt($ch, CURLOPT_HTTP_VERSION, CURL_HTTP_VERSION_1_1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $req);
    curl_setopt($ch, CURLOPT_SSLVERSION, 6);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    curl_setopt($ch, CURLOPT_FORBID_REUSE, 1);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Connection: Close'));
    $res = curl_exec($ch);

    if (!$res) {
        $errno = curl_errno($ch);
        $errstr = curl_error($ch);
        curl_close($ch);
        return "cURL error: [$errno] $errstr";
    }

    $info = curl_getinfo($ch);

    // Check the http response
    $httpCode = $info['http_code'];
    if ($httpCode != 200) {
        return "PayPal responded with http code $httpCode";
    }

    curl_close($ch);

    return 'VERIFIED';
}
