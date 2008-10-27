<table class="data_table">

<?php foreach($data as $row_id => $row_value): ?>

	<tr>
		<td><?= implode('</td><td>', array_values($row_value)); ?></td>
		<td><?= anchor(site_url($page_controller .'/edit/'.  $row_id), 'Edit'); ?></td>
	</tr>

<?php endforeach; ?>

</table>

<div class="toolbar">
<?= form_open($page_controller .'/edit/'); ?>
<?= form_submit('add_new', 'Add new'); ?>
<?= form_close(); ?>
</div>
