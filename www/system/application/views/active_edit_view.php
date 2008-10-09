<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
<!--meta http-equiv="Content-Type" content="text/html; charset=utf-8" /-->
<title><?php echo $heading;?></title>
<link rel="stylesheet" href="/screenwerk/css/style.css" type="text/css" media="screen, projection" charset="utf-8" />
<?=$this->load->view('date_picker');?>
</head>
<body>

<?=$this->load->view('MENU', $heading);?>

<? $keys = array_keys($query); ?>
<?php echo form_open($formaction,'',array()); ?>

   <fieldset class="sw">
      <legend>ActiveEdit for: <?=$heading;?></legend>

      <?php foreach( $query as $key => $value ): ?>
         <?php if( is_array($value) ):                                  // display a list ?>
            <?php if( count($value) ):                                  // only, if there is something to list ?>
               <fieldset class="sw">
                  <legend><?=$key;?></legend>
                  <table id="<?=$key;?>_table" class="rowstyle-alt colstyle-alt no-arrow">
                     <thead>
                        <tr>
                           <td>Action</td>
                           <?php foreach( array_keys(current($value)) as $_key ): ?>
                           <th class="sortable-text"><?=$_key;?></th>
                           <?php endforeach ?>
                        </tr>
                     </thead>
                     
                     <?php foreach( $value as $_id => $_row ): ?>
                     <tr>
                        <td><?php
# id included in formaction, so it is available to possible additional subviews called at the end of view.
#echo anchor($formaction.'/'.$query['id'].'/'.$actions[$key]['remove'].'/'.$_id, 'Delete');
echo anchor($formaction.'/'.$actions[$key]['remove'].'/'.$_id, 'Delete');
                      ?></td>
                        <?php foreach( $_row as $_cell ): ?>
                        <td><?=$_cell;?></td>
                        <?php endforeach ?>
                     </tr>
                     <?php endforeach ?>
                  </table>
               </fieldset>
            <?php endif;                                                // END of listing ?>
            
         <?php elseif( strlen(strstr($key,'date')) > 0 ):                           // if it is date field ?>
            <label><?=$key;?></label>
            <?=form_input(array('name'=>$key,'value'=>$value,'class'=>"split-date"));?>
            
         <?php elseif( substr($key,-3) != '_id'):                       // if this is not a foreign key ?>
            <label><?=$key;?></label>
            <?=form_input($key,$value,($key=='id'?'READONLY':''));?>
            
         <?php else:                                                    // this is a foreign key ?>
            <?php $obj_name = substr($key,0,-3); ?>
            <label><?=$obj_name;?></label>
            <?php if( !isset($objects[$obj_name]) ):                    // no object for foreign key defined ?>
               N/A<?=form_hidden($key,0);?>
            <?php elseif( !is_array($objects[$obj_name]) ):             // foreign object should be an array ?>
               Not Array
            <?php elseif( count($objects[$obj_name]) == 1 ):            // single-value object ?>
               <?php if( !isset( $objects[$obj_name][$value] ) ):       // conflict with currently selected FK ?>
                  <nobr>Reassign from ID '<?=$value;?>' to ID '<?=current(array_keys($objects[$obj_name]));?>', '<?=current($objects[$obj_name]);?>'</nobr>
                  <?=form_hidden($key,current(array_keys($objects[$obj_name])));?>
               <?php elseif( is_array( $objects[$obj_name][$value] ) ): // should not happen ?>
                  <?="POOR OBJECT: ".implode($objects[$obj_name][$value],":"); ?>
               <?php else: ?>
                  <?=form_hidden($key,$value);?>
                  <nobr><?=$objects[$obj_name][$value];?></nobr>
               <?php endif; ?>
            <?php elseif( count($objects[$obj_name]) > 1 ):             // array with multiple objects ?>
               <?=form_dropdown($key,$objects[$obj_name],$value);?>
            <?php else:                                                 // unspecified case should be treated as bug ?>
               Foo. BAR!
            <?php endif; ?>
         <?php endif; ?>
         <br/>
      <?php endforeach; ?>

      <?=form_submit($formsubmit, isset($submitlabel)?$submitlabel:'Submit');?>
   </fieldset>
<? echo form_close(); ?>



<?php if( isset( $views ) ): ?>
   <?php foreach($views as $view_name => $view_a): ?>
      <?php foreach($view_a as $view): ?>
         <?php echo $this->load->view($view_name, $view['data'], true); ?>
         <?php echo $view_name; ?>
      <?php endforeach; ?>
   <?php endforeach; ?>
<?php endif; ?>


</body>
</html>
