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

class Form extends Controller 
{

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      $this->load->helper('form');
      $this->output->enable_profiler(TRUE);
      $this->router =& load_class('Router');	
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}
	        
	function index()
	{
      $Form = $this->Form->get_all(1);
      $this->data['query'] = $Form;
      $this->data['heading'] = "Form";

      $this->load->view('active_list_view', $this->data);
	}

	function create()
	{
	   $formaction = 'form/create';
	   $formsubmit = 'createform';
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Form->create($_POST['code'], $_POST['name']);
         redirect('/form/');
      }
      else
      {
         $this->data['legend'] = 'Form';
         $this->data['heading'] = 'Form';
         $this->data['formaction'] = $formaction;
         $this->data['formsubmit'] = $formsubmit;
         $this->data['submitlabel'] = 'create-da-form';
         $this->data['fields'] = array( new Field('code'), new Field('name') );
         $this->load->view('active_create_full_view', $this->data);
      }
	}

	function view()
	{
		$_id = $this->router->segments[3];
      $this->data['query'] = $this->Form->find($_id);
      $this->data['heading'] = 'Form';

      $this->load->view('active_view_view', $this->data);
	}

	function edit()
	{
      $_formaction = 'form/edit';
      $_formsubmit = 'edit_form';

		$_POST['id'] = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset( $_POST[$_formsubmit] ) )
      {
         $this->Form->save($_POST);
         //print_r($_POST); die();
         redirect('/form/');
      }
      
      $this->data['query'] = $this->Form->find($_POST['id']);
      $this->data['heading'] = 'Form';
      $this->data['formaction'] = $_formaction;
      $this->data['formsubmit'] = $_formsubmit;
      $this->data['submitlabel'] = 'submit-da-form';

      $this->load->view('active_edit_view', $this->data);
	}

	function delete()
	{
      $this->Form->delete($this->router->segments[3]);
      redirect('/form/');
	}

}
?>
