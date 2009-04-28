<table class="data_table" style="width: 100%;">

<?php 
	foreach($data as $row_id => $row_value):
?>

	<tr>
		<td style=""><img src="<?= base_url(); ?>images/media_<?= strtolower($row_value['type']); ?>.png" width="16px" height="16px" /></td>
		<td><b><?= $row_value['filename']; ?></b></td>
		<td style="text-align:right;"><?= $row_value['length']; ?></td>
		<td style="text-align:right;"><?= $row_value['dimension']; ?></td>
	</tr>

<?php endforeach; ?>

</table>

