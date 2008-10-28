<h2><?= humanize(plural($this->router->class)); ?></h2>

<table class="data_table">

<?php foreach($data as $row_id => $row_value): ?>

	<tr>
		<td><?= implode('</td><td>', array_values($row_value)); ?></td>
		<td><?= anchor(site_url($this->router->class .'/edit/'.  $row_id), 'Edit'); ?></td>
	</tr>

<?php endforeach; ?>

</table>

<div class="toolbar">
<?= form_open($this->router->class .'/add'); ?>
<?= form_submit('add_new', 'Add new'); ?>
<?= form_close(); ?>
</div>
