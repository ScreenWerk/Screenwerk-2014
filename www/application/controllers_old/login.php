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

class Login extends Controller 
{

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      $this->load->helper('form');
      $this->load->model('Login_model','Login',TRUE);
      $this->output->enable_profiler(TRUE);
      $this->router =& load_class('Router');	
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}
	        
	function index()
	{
      $i = 0;
      $data['heading'] = "Login";

      foreach( $this->session->userdata as $key => $value )
      {
         $data['query'][$i]['id'] = $i+1;
         $data['query'][$i]['key'] = $key;
         $data['query'][$i++]['value'] = $value;
      }
      
      $this->session->set_userdata(
         'user_id',
         isset( $this->session->userdata['user_id'] )
              ? $this->session->userdata['user_id'] + 1
              : 1
         );
      
#      session_name('SWSESSID');
#      session_register('foo');

#      $this->session->sess_read();      
      
#      print_r($this->session->userdata);
#      print_r($data);
      
      foreach( $this->session->userdata as $key => $value )
      {
         $data['query'][$i]['id'] = $i+1;
         $data['query'][$i]['key'] = $key;
         $data['query'][$i++]['value'] = $value;
      }

      $this->load->view('active_list_view', $data);
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

}
?>
