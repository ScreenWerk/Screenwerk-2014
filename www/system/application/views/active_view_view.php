<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1" />
<!--meta http-equiv="Content-Type" content="text/html; charset=utf-8" /-->
<title><?php echo $heading;?></title>
<link rel="stylesheet" href="/screenwerk/css/style.css" type="text/css" media="screen, projection" charset="utf-8" />
<?php $this->load->view('date_picker', $data); ?>
</head>
<body>

<?=$this->load->view('MENU', $heading);?>


<?php $this->load->helper('html'); ?>
<fieldset class="sw">
   <legend>ActiveView for: <?=$heading;?></legend>
   <?php foreach( $query as $key => $value ): ?>
      <?php if( is_array( $value ) && count( $value ) ): ?>
         <fieldset class="sw">
            <legend><?=$key?></legend>
            <?php $listitems = array(); ?>
            <?php foreach($value as $row): ?>
               <?php if( gettype( $row ) != "array" ): ?>
                  <?php $row = get_object_vars( $row ); ?>
               <?php endif; ?>
               <?php #print_r( $row ); ?>
               <?php if( !isset( $row[0] ) ): ?>
                  <?php $row[] = 'N/A'; ?>
               <?php endif; ?>
               <?php $listitems[] = '"'.implode('";"',$row).'"'; ?>
            <?php endforeach; ?>
            <nobr><?=ol($listitems);?></nobr>
         </fieldset>
      <?php else: ?>
         <nobr><?=$key;?>:<?=$value?></nobr>
      <?php endif; ?>
      <br/>
   <?php endforeach; ?>
</fieldset>

<?=anchor(strtolower($heading), 'Back to '.$heading);?>

<?php if( isset( $anchors ) && is_array( $anchors ) && count( $anchors ) ): ?>
   <?php foreach($anchors as $anchor): ?>
      <?=anchor($anchor['link'], $anchor['label']);?>
   <?php endforeach; ?>
<?php endif; ?>


<?php if( isset( $views ) ): ?>
<?=implode($views,"<br/>");?>
<?php endif; ?>

</body>
</html>
