
<fieldset class="sw">
<legend>&nbsp;&nbsp;<?=$heading;?>&nbsp;&nbsp;</legend>

<?php foreach ($attached_collections as $collection):?>
   <?=implode($collection,":");?>
<?php endforeach;?>

<?=form_open(strtolower($heading).'/add_collection','',array());?>
   <?=form_dropdown('collection_id',$available_collections);?>
   <?=form_submit('action','create new');?>
<?=form_close();?>


