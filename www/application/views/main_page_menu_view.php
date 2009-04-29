<ul>
<?php
	if(isset($_SESSION['menu'])) {
		foreach($_SESSION['menu'] as $key => $value):
			if($key == $page_menu_code) {
				echo '<li id="menu_current"><span>'. $value .'</span></li>' ."\n";
			} else {
				echo '<li>'. anchor(site_url($key), $value) .'</li>' ."\n";
			}
		endforeach;
	}
?>
</ul>
