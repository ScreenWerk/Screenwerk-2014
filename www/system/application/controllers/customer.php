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

class Customer extends Controller 
{

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      $this->load->helper('form');
      $this->load->model('Customer_model','Customer',TRUE);
      $this->load->model('User_model','User',TRUE);
      $this->output->enable_profiler(TRUE);
      $this->router =& load_class('Router');	
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}
	        
	function index()
	{
      $Customer = $this->Customer->get_all();
      $data['query'] = $Customer;
      $data['heading'] = "Customer";

      $this->load->view('active_list_view', $data);
	}

	function create()
	{
	   $formaction = 'customer/create';
	   $formsubmit = 'createcustomer';
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Customer->create($_POST['name']);
         redirect('/customer/');
      }
      else
      {
         $data['legend'] = 'Customer';
         $data['heading'] = 'Customer';
         $data['formaction'] = $formaction;
         $data['formsubmit'] = $formsubmit;
         $data['submitlabel'] = 'create-da-customer';
         $data['fields'] = array( new Field('name') );
         $this->load->view('active_create_full_view', $data);
      }
	}

	function view()
	{
		$_id = $this->router->segments[3];
      $data['query'] = $this->Customer->find($_id);
      $data['heading'] = 'Customer';

      $data['query']['Users'] = $this->Customer->get_users($_id);

      $this->load->view('active_view_view', $data);
	}

	function edit()
	{
      $_formaction = 'customer/edit';
      $_formsubmit = 'edit_customer';

		$_POST['id'] = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset( $_POST[$_formsubmit] ) )
      {
         $this->Customer->save($_POST);
         //print_r($_POST); die();
         redirect('/customer/');
      }
      
      $data['query'] = $this->Customer->find($_POST['id']);
      $data['heading'] = 'Customer';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-customer';

      $this->load->view('active_edit_view', $data);
	}

	function delete()
	{
      $this->Customer->delete($this->router->segments[3]);
      redirect('/customer/');
	}

}
?>
