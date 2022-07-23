<?php
include_once('auth.php');
include_once('csrf.php');
include_once('lib/cart.inc.php');
session_start();

$auth = ierg4210_auth();
if (!$auth) {
    header('Location: login.php');
    exit();
} else if (!$auth['is_admin']) {
    // header("Location: https://secure.s27.ierg4210.ie.cuhk.edu.hk/",  true, 302);
    header("Location: index.html",  true, 302);
    exit();
}

$email = htmlspecialchars($auth['email']);

// require __DIR__ . '/lib/db.inc.php';
$categories = ierg4210_cat_fetchAll();
$productResults = ierg4210_prod_fetchAll();
$orders = ierg4210_order_fetchAll("admin");
$categoryOptions = '';
$productRows = '';
$categoryRows = '';
$productPages = '';
$orderRows = '';
$totalPages = htmlspecialchars($productResults["total_pages"]);

if (!isset($_GET['page'])) {
    $page = 1;
} else {
    $page = $_GET['page'];
}

foreach ($categories as $value) {
    $catid = htmlspecialchars($value["catid"]);
    $name = htmlspecialchars($value["name"]);
    $categoryOptions .= '<option value="' . $catid . '"> ' . $name . ' </option>';
}

foreach ($categories as $value) {
    $catid = htmlspecialchars($value["catid"]);
    $name = htmlspecialchars($value["name"]);
    $categoryRows .=
        "<tr>
            <td>{$catid}</td>
            <td>{$name}</td>
        </tr>";
}

foreach ($productResults["products"] as $value) {
    $pid = htmlspecialchars($value["pid"]);
    $cat_name = htmlspecialchars($value["cat_name"]);
    $name = htmlspecialchars($value["name"]);
    $price = htmlspecialchars($value["price"]);
    $inventory = htmlspecialchars($value["inventory"]);
    $description = htmlspecialchars($value["description"]);
    $image = htmlspecialchars($value["image"]);
    $productRows .=
        "<tr>
            <td>{$pid}</td>
            <td>{$cat_name}</td>
            <td>{$name}</td>
            <td>{$price}</td>
            <td>{$inventory}</td>
            <td>{$description}</td>
            <td>" .
        (empty($value["image"]) ? 'No image' :
            '<div><img id="img-' . $pid . '" src="' . $image . '" onerror="onImageError(' . $pid . ')"/></div>') .
        "</td>
        </tr>";
}

for ($i = 1; $i <= $totalPages; $i++) {
    $link = "<a href='?page=" . $i . "#product'>" . $i . "</a>";
    if ($i == $page) {
        $link = "<a href='?page=" . $i . "#product' class='active'>" . $i . "</a>";
    }
    $productPages .= $link;
}

foreach ($orders as $value) {
    $oid = htmlspecialchars($value["oid"]);
    $txn_id = htmlspecialchars($value["txn_id"]);
    $custom_id = htmlspecialchars($value["custom_id"]);
    $status = htmlspecialchars($value["status"]);
    $buyer = htmlspecialchars($value["buyer"]);
    $guestToken = htmlspecialchars($value["guest_token"]);
    $currency = htmlspecialchars($value["currency"]);
    $products = htmlspecialchars($value["products"]);
    $total = htmlspecialchars($value["total"]);
    $createdAt = htmlspecialchars($value["created_at"]);
    $orderRows .=
        "<tr>
            <td>{$oid}</td>
            <td>{$txn_id}</td>
            <td>{$custom_id}</td>
            <td>{$status}</td>
            <td>{$buyer}</td>
            <td>{$guestToken}</td>
            <td>{$currency}</td>
            <td>{$products}</td>
            <td>{$total}</td>
            <td>{$createdAt}</td>
        </tr>";
}

?>

<html>

<head>
    <title>Admin Panel</title>
    <meta http-equiv="content-type" content="text/html; charset=utf-8" />
    <link rel="stylesheet" type="text/css" href="style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
</head>

<body>
    <nav class="menu">
        <div class="menu-items">
            <h1>Admin Panel</h1>
            <a href="#category" onclick="toggleSection('#category')">Category</a>
            <a href="#product" onclick="toggleSection('#product')">Product</a>
            <a href="#order" onclick="toggleSection('#order')">Order</a>
        </div>
        <div class="menu-items">
            <span class="menu-items"><img src="avatar.png" width="20" /><?php echo $email ?></span>
            <a href="#change_password" onclick="toggleSection('#change_password')">Change Password</a>
            <form method="POST" action="auth-process.php?action=<?php echo ($action = 'logout'); ?>" enctype="multipart/form-data" class="logout-btn">
                <input type="submit" value="Logout" />
                <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
            </form>
        </div>
    </nav>

    <div class="main">
        <!--  home section -->
        <section id="home">
            <h4>Click the links above to manage items</h4>
        </section>

        <!--  category section -->
        <section id="category">
            <h3>Category</h3>
            <div class="container">
                <!-- category table -->
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <?php echo $categoryRows; ?>
                </table>
                <div class="forms-container">
                    <!-- create category form -->
                    <fieldset id="cat_insert_form">
                        <legend> New Category</legend>
                        <form id="cat_insert" method="POST" action="admin-process.php?role=admin&action=<?php echo ($action = 'cat_insert'); ?>" enctype="multipart/form-data">
                            <label for="cat_name"> Name *</label>
                            <div> <input id="cat_name" type="text" name="name" required pattern="^[\w\- ]+$" /></div>
                            <input type="submit" value="Submit" />
                            <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
                        </form>
                    </fieldset>
                    <!-- edit category form -->
                    <fieldset id="cat_edit_form">
                        <legend> Edit Category</legend>
                        <form id="cat_edit" method="POST" action="admin-process.php?role=admin&action=<?php echo ($action = 'cat_edit'); ?>" enctype="multipart/form-data">
                            <label for="edit_cat_catid"> Category *</label>
                            <div>
                                <select id="edit_cat_catid" name="catid" onchange="onCatidChange()" required>
                                    <option value="">Select a category</option>
                                    <?php echo $categoryOptions; ?>
                                </select>
                            </div>
                            <label for="edit_cat_name"> Name *</label>
                            <div> <input id="edit_cat_name" type="text" name="name" required pattern="^[\w\- ]+$" disabled /></div>
                            <input id="edit_cat_btn" type="submit" value="Edit" disabled />
                            <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
                        </form>
                    </fieldset>
                    <!-- delete category form -->
                    <fieldset id="cat_delete_form">
                        <legend> Delete Category</legend>
                        <form id="cat_delete" method="POST" action="admin-process.php?role=admin&action=<?php echo ($action = 'cat_delete'); ?>" enctype="multipart/form-data" onsubmit="return confirm('Are you sure? This action will delete all products in this category.')">
                            <label for="cat_catid"> Category *</label>
                            <div> <select id="cat_catid" name="catid" required>
                                    <option value="">Select a category</option>
                                    <?php echo $categoryOptions; ?>
                                </select></div>
                            <input type="submit" value="Delete" />
                            <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
                        </form>
                    </fieldset>
                </div>
            </div>
        </section>

        <!--  product section -->
        <section id="product">
            <h3>Product</h3>
            <div class="container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Inventory</th>
                            <th>Description</th>
                            <th>Image</th>
                        </tr>
                    </thead>
                    <?php echo $productRows; ?>
                </table>
                <div class="forms-container">
                    <!-- create product form -->
                    <fieldset id="prod_insert_form">
                        <legend> New Product</legend>
                        <form id="prod_insert" method="POST" action="admin-process.php?role=admin&action=<?php echo ($action = 'prod_insert'); ?>" enctype="multipart/form-data">
                            <label for="prod_catid"> Category *</label>
                            <div>
                                <select id="prod_catid" name="catid" required>
                                    <option value="">Select a category</option>
                                    <?php echo $categoryOptions; ?>
                                </select>
                            </div>
                            <label for="prod_name"> Name *</label>
                            <div> <input id="prod_name" type="text" name="name" required pattern="^[\w\- ]+$" /></div>
                            <label for="prod_price"> Price *</label>
                            <div> <input id="prod_price" type="text" name="price" required pattern="^\d+\.?\d*$" /></div>
                            <label for="prod_inventory"> Inventory *</label>
                            <div> <input id="prod_inventory" type="number" name="inventory" required min="1"></div>
                            <label for="prod_desc"> Description </label>
                            <div> <textarea id="prod_desc" type="text" name="description"></textarea> </div>
                            <label for="prod_image"> Image * </label>
                            <span id="image_error" class="error-msg"></span>
                            <div class="drag-n-drop" onclick="triggerFileUpload(0)" ondragover="handleDragOver(event)" ondrop="handleOnDrop(event)">
                                <p>Drag & drop or click to upload image</p>
                                <div id="thumbnail_0"></div>
                            </div>
                            <div><input id="file_input_0" type="file" name="file" accept=".png, .jpeg, .jpg, .gif" hidden /></div>
                            <input id="prod_insert_submit" type="submit" value="Submit" />
                            <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
                        </form>
                    </fieldset>

                    <!-- edit product form -->
                    <fieldset id="prod_edit_form">
                        <legend> Edit Product</legend>
                        <form id="prod_edit" method="POST" action="admin-process.php?role=admin&action=<?php echo ($action = 'prod_edit'); ?>" enctype="multipart/form-data">
                            <label for="edit_prod_pid"> Product ID*</label>
                            <div> <input id="edit_prod_pid" type="number" name="pid" required min="1" onchange="onPidChange()"></div>
                            <div id="pid_error" class="error-msg"></div>
                            <label for="edit_prod_catid"> Category *</label>
                            <div>
                                <select class="edit_prod_field" id="edit_prod_catid" name="catid" disabled required>
                                    <option value="">Select a category</option>
                                    <?php echo $categoryOptions; ?>
                                </select>
                            </div>
                            <label for="edit_prod_name"> Name *</label>
                            <div> <input class="edit_prod_field" id="edit_prod_name" type="text" name="name" required pattern="^[\w\- ]+$" disabled /></div>
                            <label for="edit_prod_price"> Price *</label>
                            <div> <input class="edit_prod_field" id="edit_prod_price" type="text" name="price" required pattern="^\d+\.?\d*$" disabled /></div>
                            <label for="edit_prod_inventory"> Inventory *</label>
                            <div> <input class="edit_prod_field" id="edit_prod_inventory" type="number" name="inventory" required min="1" disabled></div>
                            <label for="edit_prod_desc"> Description</label>
                            <div> <textarea class="edit_prod_field" id="edit_prod_desc" type="text" name="description" disabled></textarea> </div>
                            <label for="edit_prod_image"> Image * </label>
                            <div>
                                <label for="edit_prod_old_image_name"> Old Image: </label>
                                <span id="edit_prod_old_image_name">No image</span>
                                <div class="new-image-container">
                                    <label for="edit_prod__image_name"> New Image: </label>
                                    <button type="button" onclick="clearImage()">Clear</button>
                                </div>
                                <div class="drag-n-drop disabled" onclick="triggerFileUpload(1)" ondragover="handleDragOver(event)" ondrop="handleOnDrop(event)">
                                    <p>Drag & drop or click to upload image</p>
                                    <div id="thumbnail_1"></div>
                                </div>
                                <div><input id="file_input_1" class="edit_prod_field" type="file" name="file" accept=".png, .jpeg, .jpg, .gif" hidden /></div>
                            </div>
                            <div> <img id="edit_prod_new_image" width="300" /></div>
                            <input id="edit_prod_submit" type="submit" value="Edit" disabled />
                            <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
                        </form>
                    </fieldset>
                    <!-- delete product form -->
                    <fieldset id="prod_delete_form">
                        <legend> Delete Product</legend>
                        <form id="prod_delete" method="POST" action="admin-process.php?role=admin&action=<?php echo ($action = 'prod_delete'); ?>" enctype="multipart/form-data">
                            <label for="prod_pid"> Product ID*</label>
                            <div> <input id="prod_pid" type="number" name="pid" required min="1"></div>
                            <input type="submit" value="Delete" />
                            <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
                        </form>
                    </fieldset>
                    <!-- delete product by category form -->
                    <fieldset id="prod_delete_by_catid_form">
                        <legend> Delete Product By Category</legend>
                        <form id="prod_delete_by_catid" method="POST" action="admin-process.php?role=admin&action=<?php echo ($action = 'prod_delete_by_catid'); ?>" enctype="multipart/form-data">
                            <label for="cat_catid"> Category *</label>
                            <div> <select id="cat_catid" name="catid" required>
                                    <option value="">Select a category</option>
                                    <?php echo $categoryOptions; ?>
                                </select></div>
                            <input type="submit" value="Delete" />
                            <input type="hidden" name="nonce" value="<?php echo csrf_getNonce($action); ?>" />
                        </form>
                    </fieldset>

                </div>
            </div>
            <div class="pagination-container">
                <div class="pagination">
                    <a href="?page=<?php echo $page == 1 ? 1 : $page - 1; ?>#product">&lt;</a>
                    <?php echo $productPages; ?>
                    <a href="?page=<?php echo $page == $totalPages ? $totalPages : $page + 1; ?>#product">&gt;</a>
                </div>
            </div>
        </section>

        <!-- change password section -->
        <section id="change_password">
            <form id="change_pw_form" class="auth-container">
                <!-- <form method="POST" action="auth-process.php?action=change_password" enctype="multipart/form-data" class="auth-container" id="change_pw_form"> -->
                <fieldset>
                    <legend align="center" class="change-pw-title">Change Password</legend>
                    <div class="login-field">
                        <label for="email">Email</label>
                        <div> <input id="email" type="text" name="email" required disabled pattern="^[\w=+-/][\w='+-/.]*@[\w-]+(.[\w-]+)*(.[\w]{2,6})$" value="<?php echo $email; ?>" /></div>
                        <label for=" email">Old Password</label>
                        <div> <input id="old_password" type="password" name="old_password" required pattern="^[\w@#$%^&*-]+$" /></div>
                        <label for=" email">New Password</label>
                        <div> <input id="new_password" type="password" name="new_password" required pattern="^[\w@#$%^&*-]+$" /></div>
                    </div>
                    <div class="login-btn">
                        <input type="submit" value="Submit" onclick="changePassword(event)" />
                    </div>
                </fieldset>
            </form>
        </section>

        <section id="order">
            <table class="order-table" style="width: 100%;">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Txn ID</th>
                        <th>Custom ID</th>
                        <th>Status</th>
                        <th>Buyer</th>
                        <th>Guest Token</th>
                        <th>Currency</th>
                        <th>Products</th>
                        <th>Total</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <?php echo $orderRows; ?>
            </table>
        </section>
    </div>

    <script src="script.js"></script>
</body>

</html>