<h2><?= humanize(plural($this->router->class)); ?></h2>

<table class="data_table">

<?php 
	$header_set = FALSE;
	foreach($data as $row_id => $row_value):
		if(!$header_set) {
			echo '<tr><th>'. implode('</th><th>', array_keys($row_value)) .'</th></tr>';
			$header_set=TRUE;
		}
?>

	<tr>
		<td><?= implode('</td><td>', array_values($row_value)); ?></td>
<?php
	if(isset($_SESSION['forms'][$this->router->class .'/edit'])) {
		echo '<td>'. anchor(site_url($this->router->class .'/edit/'.  $row_id), 'Edit') .'</td>';
	}
	if(isset($_SESSION['forms'][$this->router->class .'/generate_playlist']))
	{
	   if( $row_value['synchronized'] == 'No' )
   		echo '<td>'. anchor(site_url($this->router->class .'/generate_playlist/'.  $row_id), 'Generate Playlist') .'</td>';
	}
?>
	</tr>

<?php endforeach; ?>

</table>
