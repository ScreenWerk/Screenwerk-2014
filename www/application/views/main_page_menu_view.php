<ul id="primary">
<?php
	if(isset($_SESSION['forms'])) {
		foreach($_SESSION['forms'] as $key => $value):
			if($page_menu_code == $key) {
				echo '<li><span>'. $value .'</span>';
				if(isset($page_submenu)) {
					echo '<ul id="secondary">';
					foreach ($page_submenu as $sub_key => $sub_value):
						echo '<li>'. anchor(site_url($sub_key), $sub_value) .'</li>';
					endforeach;
					echo '</ul>';
				}
				echo '</li>';
			} else {
				echo '<li>'. anchor(site_url($key), $value) .'</li>';
			}
		endforeach;
	}
?>
</ul>
