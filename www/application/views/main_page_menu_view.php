<ul id="primary">
<?php
	if(isset($_SESSION['forms'])) {
		foreach($_SESSION['forms'] as $key => $value):
			if($page_menu_code == $key) {
				echo '<li><span>'. $value .'</span></li>';
			} else {
				echo '<li>'. anchor(site_url($key), $value) .'</li>';
			}
		endforeach;
	}
?>
</ul>
