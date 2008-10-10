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

<fieldset class="sw">
<legend>&nbsp;&nbsp;ActiveList for: <?=$heading;?>&nbsp;&nbsp;</legend>

<?php if(count($query)):?>
<?php $first = current($query); ?>
<? $keys = array_keys($first); ?>


<table>
   <tr>
      <?php foreach($keys as $key):?>
         <th>
            <?php if(is_array($first[$key])):?>
               <?=substr($key,0,-3);?>
               <br/>
               <?=implode(array_keys($first[$key]),":");?>
            <?php else:?>
               <?=$key;?>
            <?php endif;?>
         </th>
      <?php endforeach;?>
      <th></th>
   </tr>

   <?php foreach($query as $item):?>
   <tr>
      <?php foreach($keys as $key):?>
         <td>
            <?php if(is_array($item[$key])):?>
               <?=implode($item[$key],":");?>
            <?php else:?>
               <?=$item[$key];?>
            <?php endif;?>
         </td>
      <?php endforeach;?>
      <td><nobr>
         <?=anchor(strtolower($heading).'/view/'.$item['id'], 'View');?>
         <?=anchor(strtolower($heading).'/edit/'.$item['id'], 'Edit');?>
         <?=anchor(strtolower($heading).'/delete/'.$item['id'], 'Delete');?>
      </nobr></td>
   </tr>
   <?php endforeach;?>
</table>

<?php else:?>
no rows	
<?php endif;?>	

</fieldset>

<?
 echo form_open(strtolower($heading).'/create','',array());
 echo form_submit('action','create new');
 echo form_close();
?>


</body>
</html>
