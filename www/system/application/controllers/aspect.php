<?php
class Field
{
   function __construct( $name, $type = null, $default = null, $max_length = null, $primary_key = 0 )
   {
      $this->name = $name;
      $this->type = $type;
      $this->default = $default;
      $this->max_length = $max_length;
      $this->primary_key = $primary_key;
   }
}

class Aspect extends Controller 
{
   var $models = array(
            'Aspect', 
            'Dimension'
         );

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      $this->load->helper('form');
      
      foreach( $this->models as $_model ) $this->load->model($_model.'_model',$_model,TRUE);

      $this->output->enable_profiler(TRUE);      
      $this->router =& load_class('Router');
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}



	function index()
	{
      $Aspects = $this->Aspect->find_all();

      $data['query'] = $Aspects;
      $data['heading'] = "Aspect definition";

      $this->load->view('active_list_view', $data);
	}



	function create()
	{
      $formaction = 'aspect/create';
      $formsubmit = 'create_aspect';
	
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Aspect->create($_POST['name'],$_POST['ratio'],$_POST['description']);
         redirect('/aspect/');
      }
      else
      {
         $data['heading'] = 'Aspect';
         $data['legend'] = 'Aspect';
         $data['formaction'] = $formaction;
         $data['formsubmit'] = $formsubmit;

         $data['fields'] = array( new Field('name'), new Field('ratio'), new Field('description') );
         $this->load->view('active_create_full_view', $data);
      }
	}



	function view()
	{
      $data['query'] = $this->Aspect->find($this->router->segments[3]);
      $data['heading'] = 'Aspect';
      $this->load->view('active_view_view', $data);
	}

	function edit()
	{
      redirect('/aspect/');
	}

	function delete()
	{
      $this->Aspect->delete($this->router->segments[3]);
      redirect('/aspect/');
	}

}
?>
