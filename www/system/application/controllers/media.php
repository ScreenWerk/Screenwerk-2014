<?php
class Field {
   function __construct( $name, $type = null, $max_length = null, $primary_key = 0)
   {
      $this->name = $name;
      $this->type = $type;
      $this->max_length = $max_length;
      $this->primary_key = $primary_key;
   }
}

class Media extends Controller {

   var $models = array( 'Media', 'Bundle', 'Dimension' );

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('form');

      foreach( $this->models as $_model ) $this->load->model($_model.'_model',$_model,TRUE);

      $this->load->model('Dimension_model','Dimension',TRUE);
      $this->output->enable_profiler(TRUE);
      $this->router =& load_class('Router');
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}
	        
	function index()
	{
      $Media = $this->Media->get_last_ten();
      foreach( $Media as $key => $value )
      {
         $Media[$key]['dimension_id'] = $this->Dimension->find($Media[$key]['dimension_id']);
      }
      $data['query'] = $Media;
      $data['heading'] = "Media";

      $this->load->view('active_list_view', $data);
	}

	function create()
	{
      if( isset( $_POST['filename'] ) 
         && isset( $_POST['width'] ) && isset( $_POST['height'] ) 
         && isset( $_POST['class'] ) && isset( $_POST['length'] ) )
      {
         $this->Media->create($_POST['name'],$_POST['width'],$_POST['height'],$_POST['class'],$_POST['length']);
         redirect('/media/');
      }
      else
      {
         $data['heading'] = 'Media';
         $data['fields'] = array( new Field('name'), new Field('width'), new Field('height'), new Field('class'), new Field('length') );
         $this->load->view('active_create_view', $data);
      }
	}

	function view($id)
	{
      $data['query'] = $this->Media->find($id);
      $data['heading'] = 'Media';
      $this->load->view('active_view_view', $data);
	}

	function edit($id)
	{
      $_formaction = 'media/edit';
      $_formsubmit = 'edit_media';

      if( isset( $_POST['id'] ) && isset( $_POST['filename'] ) 
         && isset( $_POST['width'] ) && isset( $_POST['height'] ) 
         && isset( $_POST['class'] ) && isset( $_POST['length'] ) )
      {
         $this->Media->save($_POST);
         redirect('/media/');
      }
      else
      {
         $data['query'] = $this->Media->find($id);
         $Dimension = $this->Dimension->find($data['query']['dimension_id']);
         $data['objects']['dimension'][$Dimension['id']] = $Dimension['dimension_x'].'x'.$Dimension['dimension_y'];
         $data['query']['width'] = $Dimension['dimension_x'];
         $data['query']['height'] = $Dimension['dimension_y'];
         $data['heading'] = 'Media';
         $data['formaction'] = $_formaction;
         $data['formsubmit'] = $_formsubmit;
         $this->load->view('active_edit_view', $data);
      }
	}

	function delete()
	{
      $this->Media->delete($this->router->segments[3]);
      $this->index();
	}

}
?>
