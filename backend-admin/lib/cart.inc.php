<?php
require 'vendor/autoload.php';
include_once('db.inc.php');
// $dotenv = Dotenv\Dotenv::createMutable('/Applications/XAMPP/xamppfiles/htdocs/ierg4210/');
$dotenv = Dotenv\Dotenv::createMutable('/var/www/html/');
$dotenv->load();

function resizeImage($filename, $width = 200, $height = 200)
{
    // $path = "/Applications/XAMPP/xamppfiles/htdocs/ierg4210/lib/images/";
    $path = "/var/www/html/lib/images/";
    $thumbnailPath =  $path . 'thumbnails/';
    $originalFullPath = $path . $filename;
    $thumbnailFullPath = $thumbnailPath . $filename;
    $extension = pathinfo($originalFullPath)['extension'];

    // get thumbnail url for public access
    $env = $_ENV['NODE_ENV'];
    $imageBaseUrl = ($env == 'production') ? $_ENV['PROD_IMAGE_BASE_URL'] :  $_ENV['DEV_IMAGE_BASE_URL'];
    $imageUrl = $imageBaseUrl . 'thumbnails/' . $filename;

    // resize if file exists
    if (file_exists($originalFullPath)) {
        // Get new dimensions
        list($originalWidth, $originalHeight) = getimagesize($originalFullPath);
        $ratio = $originalWidth / $originalHeight;
        if ($width / $height > $ratio) {
            $width = $height * $ratio;
        } else {
            $height = $width / $ratio;
        }

        // resize the image and return the thumbnail url
        $newImage = imagecreatetruecolor($width, $height);
        switch ($extension) {
            case 'gif':
                $image = imagecreatefromgif($originalFullPath);
                $resizedImage = imagescale($image, $width, -1);
                imagegif($resizedImage, $thumbnailFullPath, 9);
                return $imageUrl;
            case 'png':
                // need to take care of images with transparency
                $image = imagecreatefrompng($originalFullPath);
                imagealphablending($newImage, false);
                imagesavealpha($newImage, true);
                $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
                imagefilledrectangle($newImage, 0, 0, $width, $height, $transparent);
                imagecopyresampled($newImage, $image, 0, 0, 0, 0, $width, $height, $originalWidth, $originalHeight);
                imagepng($newImage, $thumbnailFullPath, 9);
                return $imageUrl;
            case 'jpg':
            case 'jpeg':
                $image = imagecreatefromjpeg($originalFullPath);
                imagecopyresampled($newImage, $image, 0, 0, 0, 0, $width, $height, $originalWidth, $originalHeight);
                imagejpeg($newImage, $thumbnailFullPath, 100);
                return $imageUrl;
        }
    }
}

// when a product is edited (with new image) or deleted, check if its old image is unused. If so, delete it to save space
function removeUnusedImage($pid)
{
    global $db;
    $db = ierg4210_DB();
    // $path = "/Applications/XAMPP/xamppfiles/htdocs/ierg4210/lib/images/";
    $path = "/var/www/html/lib/images/";
    $thumbnailPath =  $path . 'thumbnails/';

    // get the name of the old image 
    $q = $db->prepare("SELECT image FROM products WHERE pid = ?");
    $q->bindParam(1, $pid);
    if ($q->execute()) {
        $result = $q->fetch();
        if (!$result)
            throw new Exception("Product not found");
        else {
            $oldFilename = $result['image'];
            if ($oldFilename) {
                // check if there are other products using the same image
                $q = $db->prepare("SELECT pid FROM products WHERE image = ?");
                $q->bindParam(1, $oldFilename);
                $q->execute();
                $result = $q->fetchAll();

                // if no other product using the same image, delete the old image
                if (count($result) == 1) {
                    unlink($path . $oldFilename);
                    unlink($thumbnailPath . $oldFilename);
                }
            }
        }
    }
}

function validateFile($file)
{
    $format = array("image/gif",  "image/jpeg", "image/jpg", "image/png");
    return  $file["error"] == 0
        && in_array($file["type"], $format)
        && in_array(mime_content_type($file["tmp_name"]), $format)
        && $file["size"] <= 10000000;
}

function validateProductInput($pid, $catid, $name, $price, $inventory)
{
    // for insert product, pid will be NEW_PRODUCT_ID
    if ($pid !== "NEW_PRODUCT_ID") {
        if (!preg_match('/^\d*$/', $pid) || $pid <= 0)
            throw new Exception("Invalid product id");
    }
    if (!preg_match('/^\d*$/', $catid) || $catid <= 0)
        throw new Exception("Invalid category id");
    if (!preg_match('/^[\w\- ]+$/', $name))
        throw new Exception("Invalid name");
    $sanitizedPrice = filter_var($price, FILTER_SANITIZE_NUMBER_FLOAT);
    if (!preg_match('/^[\d\.]+$/', $price) || !filter_var($sanitizedPrice, FILTER_VALIDATE_FLOAT))
        throw new Exception("Invalid price");
    $sanitizedInventory = filter_var($inventory, FILTER_SANITIZE_NUMBER_INT);
    if (!preg_match('/^[1-9][0-9]*$/', $inventory) || !filter_var($sanitizedInventory, FILTER_VALIDATE_INT))
        throw new Exception("Invalid inventory");
}

function ierg4210_cat_fetchAll()
{
    global $db;
    $db = ierg4210_DB();
    $q = $db->prepare("SELECT * FROM categories");
    if ($q->execute()) {
        $result = $q->fetchAll();
        return $result;
    }
}

function ierg4210_cat_fetchOne()
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // get input & validation 
    $catid = $_GET["catid"];
    if (!preg_match('/^\d*$/', $catid))
        throw new Exception("Invalid category id");

    // fetch operation
    $q = $db->prepare("SELECT * FROM categories WHERE catid = ?");
    $q->bindParam(1, $catid);
    if ($q->execute()) {
        $result = $q->fetch();
        if (count($result) == 0)
            throw new Exception("Category not found");
        else
            return $result;
    }
}

function ierg4210_cat_insert()
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // get input & validation 
    $name = $_POST["name"];
    if (!preg_match('/^[\w\- ]+$/', $name))
        throw new Exception("Invalid name");

    // insert operation
    $sql = "INSERT INTO categories (name) VALUES (?)";
    $q = $db->prepare($sql);
    $q->bindParam(1, $name);
    if ($q->execute()) {
        header('Location: admin.php#category');
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo 'Failed to create category.<br/><a href="javascript:history.back();">Back to admin panel.</a>';
    }
    exit();
}

function ierg4210_cat_edit()
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // get input & validation 
    $catid = $_POST["catid"];
    $name = $_POST["name"];
    if (!preg_match('/^\d*$/', $catid) || $catid <= 0)
        throw new Exception("Invalid category id");
    if (!preg_match('/^[\w\- ]+$/', $name))
        throw new Exception("Invalid name");

    // update operation
    $sql = "UPDATE categories SET name = ? WHERE catid = ?";
    $q = $db->prepare($sql);
    $q->bindParam(1, $name);
    $q->bindParam(2, $catid);
    if ($q->execute()) {
        header('Location: admin.php#category');
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo 'Failed to edit category.<br/><a href="javascript:history.back();">Back to admin panel.</a>';
    }
    exit();
}

function ierg4210_cat_delete()
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // delete products of the category first to avoid foreign key constraint violation
    ierg4210_prod_delete_by_catid('DELETE_CATEGORY');

    // get input & validation 
    $catid = $_POST["catid"];
    if (!preg_match('/^\d*$/', $catid) || $catid <= 0)
        throw new Exception("Invalid category id");

    // delete operation
    $q = $db->prepare("DELETE FROM categories WHERE catid = ?");
    $q->bindParam(1, $catid);
    if ($q->execute()) {
        header('Location: admin.php#category');
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo 'Failed to delete category.<br/><a href="javascript:history.back();">Back to admin panel.</a>';
    }
    exit();
}

function ierg4210_prod_fetchAll()
{
    // DB manipulation & get page number
    global $db;
    $db = ierg4210_DB();
    $page = 1;
    if (isset($_GET["page"]))
        $page = $_GET["page"];
    $pageSize = 10;
    if (isset($_GET["page_size"]))
        $pageSize = $_GET["page_size"];
    $startFrom = ($page - 1) * $pageSize;

    // fetch operation
    $q = $db->prepare("SELECT pid, p.catid, p.name, price, description, image, inventory, cat.name AS cat_name FROM products p INNER JOIN categories cat ON p.catid = cat.catid LIMIT ?, ?");
    $q->bindParam(1, $startFrom);
    $q->bindParam(2, $pageSize);
    if ($q->execute()) {
        $result = $q->fetchAll();
        if (count($result) == 0) {
            return [
                "total_pages" =>  0,
                "products" => $result
            ];
        } else {
            // get resized image for each product
            $products = array_map(function ($product) {
                if (!empty($product['image'])) {
                    $product['image'] = resizeImage($product["image"]);
                } else {
                    $product["image"] = "";
                }
                return $product;
            }, $result);
            // return result

            // get total no. of pages
            $q = $db->prepare("SELECT COUNT(*) FROM products p INNER JOIN categories cat ON p.catid = cat.catid");
            $q->execute();
            $totalPages = ceil($q->fetchColumn() / $pageSize);
            return [
                "total_pages" =>  $totalPages,
                "products" => $products
            ];
        }
    }
}

function ierg4210_prod_fetchByCatid()
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // get input & validation 
    $page = 1;
    if (isset($_GET["page"]))
        $page = $_GET["page"];
    $pageSize = 10;
    if (isset($_GET["page_size"]))
        $pageSize = $_GET["page_size"];
    $startFrom = ($page - 1) * $pageSize;
    $catid = $_GET["catid"];
    if (!preg_match('/^\d*$/', $catid))
        throw new Exception("Invalid category id");

    // fetch operation
    $q = $db->prepare("SELECT pid, p.catid, p.name, price, description, image, inventory, cat.name AS cat_name FROM products p INNER JOIN categories cat ON p.catid = cat.catid WHERE p.catid = ? LIMIT ?, ?");
    $q->bindParam(1, $catid);
    $q->bindParam(2, $startFrom);
    $q->bindParam(3, $pageSize);
    if ($q->execute()) {
        $result = $q->fetchAll();
        if (count($result) == 0) {
            return [
                "total_pages" =>  0,
                "products" => $result
            ];
        } else {
            $products = array_map(function ($product) {
                if (!empty($product['image'])) {
                    $product['image'] = resizeImage($product["image"]);
                } else {
                    $product["image"] = "";
                }
                return $product;
            }, $result);

            // get total no. of pages
            $q = $db->prepare("SELECT COUNT(*) FROM products p INNER JOIN categories cat ON p.catid = cat.catid WHERE p.catid = ?");
            $q->bindParam(1, $catid);
            $q->execute();
            $totalPages = ceil($q->fetchColumn() / $pageSize);
            return [
                "total_pages" =>  $totalPages,
                "products" => $products
            ];
        }
    }
}

function ierg4210_prod_fetchOne($pid = null, $getThumbnail = false)
{
    // DB manipulation & set base url
    global $db;
    $db = ierg4210_DB();
    $env = $_ENV['NODE_ENV'];
    $imageBaseUrl = ($env == 'production') ? $_ENV['PROD_IMAGE_BASE_URL'] :  $_ENV['DEV_IMAGE_BASE_URL'];
    $url = $imageBaseUrl;

    // get input & validation 
    $pid = isset($_GET["pid"]) ? $_GET["pid"] : $pid;
    if (!preg_match('/^\d*$/', $pid))
        throw new Exception("Invalid product id");

    // fetch operation
    $q = $db->prepare("SELECT pid, p.catid, p.name, price, description, image, inventory, cat.name AS cat_name FROM products p INNER JOIN categories cat ON p.catid = cat.catid WHERE pid = ?");
    $q->bindParam(1, $pid);
    if ($q->execute()) {
        $result = $q->fetch();
        if (!$result) {
            throw new Exception("Product not found");
        }
        if ($getThumbnail) {
            if (!empty($result['image'])) {
                $result['image'] = resizeImage($result["image"], 150, 150);
            } else {
                $result["image"] = "";
            }
            return $result;
        }
        $result['image'] = $url . $result['image'];
        return $result;
    }
}

function ierg4210_prod_insert()
{
    // DB manipulation & variables
    global $db;
    $db = ierg4210_DB();
    // $path = "/Applications/XAMPP/xamppfiles/htdocs/ierg4210/lib/images/";
    $path = "/var/www/html/lib/images/";
    $errorMsg = '';

    // get input & validation 
    $catid = $_POST["catid"];
    $name = $_POST["name"];
    $price = $_POST["price"];
    $inventory = $_POST["inventory"];
    $desc = $_POST["description"];
    // (NOTE: now set group to everyone but not a sol)
    validateProductInput("NEW_PRODUCT_ID", $catid, $name, $price, $inventory);

    // insert operation
    // insert the product iff the image is valid
    if (validateFile($_FILES["file"])) {
        $filename = $_FILES["file"]["name"];

        $sql = "INSERT INTO products (catid, name, price,inventory,  description, image) VALUES (?, ?, ?, ?, ?, ?)";
        $q = $db->prepare($sql);
        $q->bindParam(1, $catid);
        $q->bindParam(2, $name);
        $q->bindParam(3, $price);
        $q->bindParam(4, $inventory);
        $q->bindParam(5, $desc);
        $q->bindParam(6, $filename);

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $path . $filename)) {
            if ($q->execute()) {
                header('Location: admin.php#product');
                exit();
            } else {
                $errorMsg = "Failed to create product";
            }
        } else {
            $errorMsg = 'Failed to upload product image';
        }
    } else {
        $errorMsg = 'Invalid file detected';
    }

    header('Content-Type: text/html; charset=utf-8');
    echo $errorMsg . '<br/><a href="javascript:history.back();">Back to admin panel.</a>';
    exit();
}

function ierg4210_prod_edit()
{
    // DB manipulation & variables
    global $db;
    $db = ierg4210_DB();
    // $path = "/Applications/XAMPP/xamppfiles/htdocs/ierg4210/lib/images/";
    $path = "/var/www/html/lib/images/";
    $errorMsg = '';

    // get input & validation 
    $pid = $_POST["pid"];
    $catid = $_POST["catid"];
    $name = $_POST["name"];
    $price = $_POST["price"];
    $inventory = $_POST["inventory"];
    $desc = $_POST["description"];
    validateProductInput($pid, $catid, $name, $price, $inventory);

    // update operation
    $sql = "UPDATE products SET catid = ?, name = ?, price = ?, inventory = ?, description = ? WHERE pid = ?";
    $q = $db->prepare($sql);
    $q->bindParam(1, $catid);
    $q->bindParam(2, $name);
    $q->bindParam(3, $price);
    $q->bindParam(4, $inventory);
    $q->bindParam(5, $desc);
    $q->bindParam(6, $pid);

    $result = $q->execute();
    // if no new image and query succeed, return to admin panel
    if ($_FILES["file"]["size"] == 0) {
        if ($result) {
            header('Location: admin.php#product');
            exit();
        } else {
            $errorMsg = "Failed to update product";
        }
    } else {
        // if have new image, handle it
        if (validateFile($_FILES["file"])) {
            $newFilename = $_FILES["file"]["name"];

            // delete the old image if unused
            removeUnusedImage($pid);

            // update the image of the product
            $sql = "UPDATE products SET image = ? WHERE pid = ?";
            $q = $db->prepare($sql);
            $q->bindParam(1, $newFilename);
            $q->bindParam(2, $pid);

            if (move_uploaded_file($_FILES["file"]["tmp_name"], $path . $newFilename)) {
                if ($q->execute()) {
                    header('Location: admin.php#product');
                    exit();
                } else {
                    $errorMsg = 'Failed to update product';
                }
            } else {
                $errorMsg = 'Failed to upload new product image';
            }
        } else {
            $errorMsg = 'Invalid file detected';
        }
    }

    header('Content-Type: text/html; charset=utf-8');
    echo $errorMsg . '<br/><a href="javascript:history.back();">Back to admin panel.</a>';
    exit();
}

function ierg4210_prod_delete()
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // get input & validation 
    $pid = $_POST["pid"];
    if (!preg_match('/^\d*$/', $pid) || $pid <= 0)
        throw new Exception("Invalid product id");

    // delete the old image if unused
    removeUnusedImage($pid);

    // delete operation
    $q = $db->prepare("DELETE FROM products WHERE pid = ?");
    $q->bindParam(1, $pid);
    if ($q->execute()) {
        header('Location: admin.php#product');
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo 'Failed to delete product.<br/><a href="javascript:history.back();">Back to admin panel.</a>';
    }
    exit();
}

function ierg4210_prod_delete_by_catid($mode = 'DELETE_PRODUCT')
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // get input & validation 
    $catid = $_POST["catid"];
    if (!preg_match('/^\d*$/', $catid) || $catid <= 0)
        throw new Exception("Invalid category id");

    // delete operation
    $q = $db->prepare("DELETE FROM products WHERE catid = ?");
    $q->bindParam(1, $catid);
    if ($q->execute()) {
        if ($mode == 'DELETE_PRODUCT') {
            header('Location: admin.php#product');
            exit();
        }
    } else {
        header('Content-Type: text/html; charset=utf-8');
        echo 'Failed to delete product.<br/><a href="javascript:history.back();">Back to admin panel.</a>';
        exit();
    }
}

function ierg4210_order_fetchAll($role = null)
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    if (isset($_GET["buyer"]) && $_GET["buyer"] != "guest") {
        $q = $db->prepare("SELECT * FROM orders WHERE buyer = ? ORDER BY created_at DESC");
        $q->bindParam(1, $_GET["buyer"]);
    } else if (isset($_GET["guest_token"]) && $_GET["buyer"] == "guest") {
        $q = $db->prepare("SELECT * FROM orders WHERE guest_token = ? ORDER BY created_at DESC");
        $q->bindParam(1, $_GET["guest_token"]);
    } else if ($role == "admin") {
        $q = $db->prepare("SELECT * FROM orders ORDER BY created_at DESC");
    } else {
        return [];
    }
    $q->execute();
    $result = $q->fetchAll();
    if (isset($_GET["role"]) && $_GET["role"] != "admin") {
        $formattedResult = array_map(function ($res) {
            $products = json_decode($res['products'], true);
            $products = array_map(function ($product) {
                $productDetails = ierg4210_prod_fetchOne($product['pid'], true);
                $productDetails['quantity'] = $product['quantity'];
                return $productDetails;
            }, $products);
            $res['products'] = json_encode($products);
            return $res;
        }, $result);
        return $formattedResult;
    } else {
        return $result;
    }
}

function ierg4210_order_fetchOne()
{
    // DB manipulation
    global $db;
    $db = ierg4210_DB();

    // get input & validation 
    $oid = $_GET["oid"];
    if (empty($oid))
        throw new Exception("Missing order id");

    // get one order
    $q = $db->prepare("SELECT * FROM orders WHERE oid = ?");
    $q->bindParam(1, $oid);
    $q->execute();
    $result = $q->fetch();
    if (!$result) {
        throw new Exception("Order not found");
    } else {
        $products = json_decode($result['products'], true);
        $products = array_map(function ($product) {
            $productDetails = ierg4210_prod_fetchOne($product['pid'], true);
            $productDetails['quantity'] = $product['quantity'];
            return $productDetails;
        }, $products);
        $result['products'] = json_encode($products);
        return $result;
    }
}
