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

class User extends Controller 
{

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      $this->load->helper('form');
      $this->load->model('User_model','User',TRUE);
      $this->load->model('Customer_model','Customer',TRUE);
      $this->output->enable_profiler(TRUE);
      $this->router =& load_class('Router');	
      
	}
	        
	function index()
	{
			$this->session->protect('user');
/*
      $User = $this->User->get_all();
      foreach( $User as $key => $value )
      {
#         $User[$key]['customer_id'] = $this->Customer->find($User[$key]['customer_id']);
      }
      $data['query'] = $User;
      $data['heading'] = "User";

      $this->load->view('active_list_view', $data);
	*/
	}

	function create()
	{
	   $formaction = 'user/create';
	   $formsubmit = 'createuser';
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->User->create($_POST['username'], $_POST['secret']);
         redirect('/user/');
      }
      else
      {
         $data['legend'] = 'User';
         $data['heading'] = 'User';
         $data['formaction'] = $formaction;
         $data['formsubmit'] = $formsubmit;
         $data['submitlabel'] = 'create-da-user';
         $data['fields'] = array( new Field('username'), new Field('secret') );
         $this->load->view('active_create_full_view', $data);
      }
	}

	function view()
	{
		$_id = $this->router->segments[3];
      $data['query'] = $this->User->find($_id);
      $data['heading'] = 'User';

      $this->load->view('active_view_view', $data);
	}

	function edit()
	{
      $_formaction = 'user/edit';
      $_formsubmit = 'edit_user';

		$_POST['id'] = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset( $_POST[$_formsubmit] ) )
      {
         $this->User->save($_POST);
         #print_r($_POST); die();
         redirect('/user/');
      }
      
      $data['query'] = $this->User->find($_POST['id']);
      unset($data['query']['secret']);
      $data['heading'] = 'User';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-user';

      $data['objects']['customer']['null'] = 'Not assigned';
      foreach( $this->Customer->get_all() as $_customer )
      {
         $data['objects']['customer'][$_customer['id']] = $_customer['name'];
      }

      $this->load->view('active_edit_view', $data);
	}

	function delete()
	{
      $this->User->delete($this->router->segments[3]);
      redirect('/user/');
	}
	
	function login() {
		$this->session->login('argo','pass');
	}

	function test() {
		$this->session->protect();
		//print_r($this->session);
	}

	function logout() {
		$this->session->logout();
	}

}
?>
