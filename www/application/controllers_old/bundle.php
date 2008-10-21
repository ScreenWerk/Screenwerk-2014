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

class Bundle extends Controller 
{

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      $this->load->helper('form');
      $this->load->model('Bundle_model','Bundle',TRUE);
      $this->load->model('Media_model','Media',TRUE);
      $this->output->enable_profiler(TRUE);
      $this->router =& load_class('Router');	
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}
	        
	function index()
	{
      $Bundle = $this->Bundle->get_last_ten();
      $data['query'] = $Bundle;
      $data['heading'] = "Bundle";

      $this->load->view('active_list_view', $data);
	}

	function create()
	{
	   $formsaction = 'bundle/create';
	   $formsubmit = 'createbundle';
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Bundle->create($_POST['name']);
         redirect('/bundle/');
      }
      else
      {
         $data['legend'] = 'Bundle';
         $data['heading'] = 'Bundle';
         $data['formaction'] = $formsaction;
         $data['formsubmit'] = $formsubmit;
         $data['submitlabel'] = 'create-da-bundle';
         $data['fields'] = array( new Field('name') );
         $this->load->view('active_create_full_view', $data);
      }
	}

	function view()
	{
		$_id = $this->router->segments[3];
      $data['query'] = $this->Bundle->find($_id);
      $data['heading'] = 'Bundle';

      $InvolvedMedias = $this->Bundle->involved_medias($_id);
      $data['query']['Involved medias'] = $InvolvedMedias;
      
      $this->load->view('active_view_view', $data);
	}

	function edit()
	{
	   $_media_submit = 'submit_bundled_medias';
      $_formaction = 'bundle/edit/' . $this->router->segments[3];
      $_formsubmit = 'edit_bundle';
      $_bundled_medias = 'Bundled medias';

		$_POST['id'] = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset($this->router->segments[4])
          && isset($this->router->segments[5])
          && $this->router->segments[4].$this->router->segments[5] == 'removemedia' )
      {
         $this->Bundle->remove_bundledmedia($this->router->segments[6]);
      }
      else if( isset( $_POST[$_formsubmit] ) )
      {
         $this->Bundle->save($_POST);
         //print_r($_POST); die();
         redirect('/bundle/');
      }
      else if( isset( $_POST[$_media_submit] ) )
      {
         $this->Bundle->add_media();
      }
      
      $data['query'] = $this->Bundle->find($_POST['id']);
      $data['heading'] = 'Bundle';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-bundle';
      $data['actions'][$_bundled_medias]['remove'] = 'remove/media';

      $BundledMedias = $this->Bundle->list_bundled_medias($_POST['id']);
      $data['query'][$_bundled_medias] = $BundledMedias;
      
      $_medias_not_in_bundle = $this->Bundle->list_medias_excl( $_POST['id'] );
      if( count( $_medias_not_in_bundle ) )
      {
         $cm_data['legend'] = 'Available medias';
         $cm_data['formaction'] = $_formaction;
         $cm_data['formsubmit'] = $_media_submit;
         $cm_data['submitlabel'] = 'Add media';

         $cm_data['fields'] = array(
            new Field( 'id', 'hidden', $_POST['id'] ),
            new Field( 'media_id', $_medias_not_in_bundle ),
            new Field( 'frequency', null, 1 ), 
            new Field( 'appearances' ), 
            new Field( 'importance' ), 
            new Field( 'probability', null, 100 ), 
            new Field( 'valid_from_date', 'date' ), 
            new Field( 'valid_to_date', 'date' )
         );
         $data['views']['active_create_view'][0]['data'] =& $cm_data;
      }
      #print_r($data);
      $this->load->view('active_edit_view', $data);
	}

	function delete()
	{
      $this->Bundle->delete($this->router->segments[3]);
      redirect('/bundle/');
	}

}
?>
