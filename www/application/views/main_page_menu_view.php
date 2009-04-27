<ul>
<?php
	if(isset($_SESSION['menu'])) {
		foreach($_SESSION['menu'] as $key => $value):
			if($key == $page_menu_code) {
				echo '<li><span id="menu_current_l">&nbsp;</span><span id="menu_current">'. $value .'</span><span id="menu_current_r"/>&nbsp;</span></li>';
			} else {
				echo '<li>'. anchor(site_url($key), $value) .'</li>';
			}
		endforeach;
	}
?>
</ul>
