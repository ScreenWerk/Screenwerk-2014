<ul>
<?php
	if(isset($_SESSION['forms'])) {
		foreach($_SESSION['forms'] as $key => $value):
			echo '<li>'. anchor(site_url($key), $value) .'</li>';
		endforeach;
	}
?>
</ul>
