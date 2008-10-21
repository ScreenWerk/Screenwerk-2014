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

class Group extends Controller 
{

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      #$this->load->helper('form');
      $this->load->model('Group_model','Group',TRUE);
      $this->output->enable_profiler(TRUE);
      $this->router =& load_class('Router');	
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}
	        
	function index()
	{
      $Group = $this->Group->get_all();
      $data['query'] = $Group;
      $data['heading'] = "Group";

      $this->load->view('active_list_view', $data);
	}

	function create()
	{
	   $formsaction = 'group/create';
	   $formsubmit = 'creategroup';
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Group->create($_POST['groupname']);
         redirect('/group/');
      }
      else
      {
         $data['legend'] = 'Group';
         $data['heading'] = 'Group';
         $data['formaction'] = $formsaction;
         $data['formsubmit'] = $formsubmit;
         $data['submitlabel'] = 'create-da-group';
         $data['fields'] = array( new Field('groupname') );
         $this->load->view('active_create_full_view', $data);
      }
	}

	function view()
	{
		$group_id = $this->router->segments[3];
      $data['query'] = $this->Group->find($group_id);
      $data['heading'] = 'Group';

      $Users = $this->Group->users($group_id);
      $data['query']['Grouped users'] = $Users;
      
      $Forms = $this->Form->get_group_forms($group_id);
      $data['query']['Group forms'] = $Forms;
      
      $this->load->view('active_view_view', $data);
	}

	function edit()
	{
	   $_user_submit = 'submit_grouped_users';
	   $_gform_submit = 'submit_group_forms';
      $_formaction = 'group/edit/' . $this->router->segments[3];
      $_formsubmit = 'edit_group';
      $_grouped_users = 'Grouped users';
      $_grouped_gforms = 'Group forms';

		$group_id = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset($this->router->segments[4]) && isset($this->router->segments[5])
          && $this->router->segments[4] . $this->router->segments[5] == 'removeuser' )
      {
         $this->Group->remove_user($this->router->segments[3], $this->router->segments[6]);
      }
      if( isset($this->router->segments[4]) && isset($this->router->segments[5])
          && $this->router->segments[4] . $this->router->segments[5] == 'removeform' )
      {
         $this->Group->remove_form($this->router->segments[3], $this->router->segments[6]);
      }
      else if( isset( $_POST[$_formsubmit] ) )
      {
         $this->Group->save($_POST);
         //print_r($_POST); die();
         redirect('/group/');
      }
      else if( isset( $_POST[$_user_submit] ) )
      {
         $this->Group->add_user();
      }
      else if( isset( $_POST[$_gform_submit] ) )
      {
         $this->Group->add_form();
      }
      
      $data['query'] = $this->Group->find($group_id);
      $data['heading'] = 'Group';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-group';
      $data['actions'][$_grouped_users]['remove'] = 'remove/user';
      $data['actions'][$_grouped_gforms]['remove'] = 'remove/form';

      $GroupedUsers = $this->Group->users($group_id);
      foreach( $GroupedUsers as $_user )
      {
         $data['query'][$_grouped_users][$_user['id']] = $_user;
      }
      
      $UsersExcl = $this->Group->users_excl($group_id);
      if( count( $UsersExcl ) )
      {
         foreach( $UsersExcl as $_user )
         {
            $_users_not_in_group[$_user['id']] = $_user['username'];
         }

         $cu_data['legend'] = 'Available users';
         $cu_data['formaction'] = $_formaction;
         $cu_data['formsubmit'] = $_user_submit;
         $cu_data['submitlabel'] = 'Add user';

         $cu_data['fields'] = array(
            new Field( 'group_id', 'hidden', $group_id ),
            new Field( 'user_id', $_users_not_in_group ),
         );
         $data['views']['active_create_view'][]['data'] = $cu_data;
      }
      
      $GroupedForms = $this->Group->forms($group_id);
      foreach( $GroupedForms as $_form )
      {
         $data['query'][$_grouped_gforms][$_form['id']] = $_form;
      }
      
      $FormsExcl = $this->Group->forms_excl($group_id);
      if( count( $FormsExcl ) )
      {
         foreach( $FormsExcl as $_form )
         {
            $_forms_not_in_group[$_form['id']] = $_form['name'];
         }

         $cu_data['legend'] = 'Available forms';
         $cu_data['formaction'] = $_formaction;
         $cu_data['formsubmit'] = $_gform_submit;
         $cu_data['submitlabel'] = 'Assign form';

         $cu_data['fields'] = array(
            new Field( 'group_id', 'hidden', $group_id ),
            new Field( 'form_id', $_forms_not_in_group ),
         );
         $data['views']['active_create_view'][]['data'] = $cu_data;
      }

      $this->load->view('active_edit_view', $data);
	}

	function delete()
	{
      $this->Group->delete($this->router->segments[3]);
      redirect('/group/');
	}

}
?>
