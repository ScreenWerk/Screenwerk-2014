<ul>
<?php
	
	if(isset($this->sess->menu)) {
		foreach($this->sess->menu as $key => $value):
			if($key == $page_menu_code) {
				echo '<li id="menu_current"><span>'. $value .'</span></li>' ."\n";
			} else {
				echo '<li>'. anchor(site_url($key), $value) .'</li>' ."\n";
			}
		endforeach;
	}

?>
</ul>
