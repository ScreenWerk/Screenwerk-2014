<?php if( isset($fields) && is_array($fields) && count($fields) ): ?>
<?php // print_r($fields); die(); ?>
<fieldset class="sw">
<legend>&nbsp;&nbsp;<?=$legend;?>&nbsp;&nbsp;</legend>

<?=form_open($formaction,'',array());?>

   <?php foreach( $fields as $field ): ?>
   
      <?php if( is_array($field->type) ): ?>
         <?=form_dropdown($field->name,$field->type);?><br/>
         <?php continue; ?>
      <?php endif; ?>

      <?php if( $field->type == 'hidden' ): ?>
         <?=form_hidden($field->name,$field->default);?>
         <?php continue; ?>
      <?php endif; ?>

      <?php if( $field->name == 'id' ) continue; ?>

      <label><?=$field->name;?></label>
      <?php if( strlen(strstr($field->name,'date')) > 0 ):                           // if it is date field ?>
         <?=form_input(array('name'=>$field->name,'value'=>$field->default,'class'=>"format-y-m-d divider-dash range-low-today",'id'=>$field->name));?>
      <?php else:?>
         <?php echo form_input($field->name,$field->default); ?>
      <?php endif;?>
      
      <br/>
      
   <?php endforeach; ?>

   <?=form_submit($formsubmit, isset($submitlabel)?$submitlabel:'Submit');?>
<?=form_close();?>
</fieldset>

<?php endif; ?>

