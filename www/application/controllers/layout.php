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

class Layout extends Controller 
{

	function __construct()
	{
      parent::Controller();
      $this->load->helper('url');
      $this->load->helper('html');
      $this->load->helper('form');
      $this->load->model('Dimension_model','Dimension',TRUE);
      $this->load->model('Layout_model','Layout',TRUE);
      $this->output->enable_profiler(TRUE);
      
      $this->router =& load_class('Router');      
      
      $this->load->model('Form_model','Form',TRUE);
      $this->data['menuitems'] = $this->Form->get_user_forms(1);
	}
	        
	function index()
	{
      $Layout = $this->Layout->get_last_ten();
      foreach( $Layout as $key => $value ) 
         $Layout[$key]['dimension_id'] = $this->Dimension->find($Layout[$key]['dimension_id']);

      $data['query'] = $Layout;
      $data['heading'] = "Layout";

      $this->load->view('active_list_view', $data);
	}

	function create()
	{
      $formaction = 'layout/create';
      $formsubmit = 'create_layout';
	
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Layout->create($_POST['name'],$_POST['length'],$_POST['width'],$_POST['height']);
         redirect('/layout/');
      }
      else
      {
         $data['heading'] = 'Layout';
         $data['legend'] = 'Layout';
         $data['formaction'] = $formaction;
         $data['formsubmit'] = $formsubmit;

         $data['fields'] = array( new Field('name'), new Field('length'), new Field('width'), new Field('height') );
         $this->load->view('active_create_full_view', $data);
      }
	}

	function view()
	{
	   $_id = $this->router->segments[3];
      $data['query'] = $this->Layout->find($_id);
      $data['heading'] = 'Layout';

      $InvolvedMedias = $this->Layout->involved_medias($_id);
      $data['query']['Involved medias'] = $InvolvedMedias;
      
      $this->load->view('active_view_view', $data);
	}

	function edit()
	{
	   $_bundle_submit = 'submit_bundle_to_layout';
      $_formaction = 'layout/edit';
      $_formsubmit = 'edit_layout';
      $_layout_bundles = 'Layout bundles';

		$_POST['id'] = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset($this->router->segments[4])
          && isset($this->router->segments[5])
          && $this->router->segments[4].$this->router->segments[5] == 'removebundle' )
      {
         $this->Layout->remove_layoutbundle($this->router->segments[3], $this->router->segments[6]);
      }
      else if( isset( $_POST[$_formsubmit] ) )
      {
         $this->Layout->save($_POST);
         //print_r($_POST); die();
         redirect('/layout/');
      }
      else if( isset( $_POST[$_bundle_submit] ) )
      {
         $this->Layout->add_bundle();
      }
      
      $data['query'] = $this->Layout->find($_POST['id']);
      $data['heading'] = 'Layout';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-layout';
      $data['actions'][$_layout_bundles]['remove'] = 'remove/bundle';

      $LayoutBundles = $this->Layout->list_layout_bundles($_POST['id']);
      $data['query'][$_layout_bundles] = $LayoutBundles;
      
      $Dimension = $this->Dimension->find($data['query']['dimension_id']);
      $data['objects']['dimension'][$Dimension['id']] = $Dimension['dimension_x'].'x'.$Dimension['dimension_y'];

      $_bundles_not_on_layout = $this->Layout->list_bundles_excl( $_POST['id'] );
      if( count( $_bundles_not_on_layout ) )
      {
         $ac_data['legend'] = 'Available bundles';
         $ac_data['formaction'] = $_formaction;
         $ac_data['formsubmit'] = $_bundle_submit;
         $ac_data['submitlabel'] = 'Add bundle';

         $ac_data['fields'] = array(
            new Field( 'id', 'hidden', $_POST['id'] ),
            new Field( 'bundle_id', $_bundles_not_on_layout ),
            new Field( 'width' ), 
            new Field( 'height' ), 
            new Field( 'position_x' ), 
            new Field( 'position_y' ), 
//            new Field( 'position_z', null, 1 ), this could be introduced for 3rd dimension
            new Field( 'start_sec' ), 
            new Field( 'stop_sec' )
         );
         $data['views']['active_create_view']['data'] =& $ac_data;
      }
      $this->load->view('active_edit_view', $data);
	}

	function delete()
	{
      $this->Layout->delete($this->router->segments[3]);
      redirect('/layout/');
	}

}
?>
