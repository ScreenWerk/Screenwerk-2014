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

class Collection extends Controller 
{
   var $models = array(
            'left' => 'Layout', 
            'right' => 'Collection', 
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
      $Collection = $this->Collection->get_last_ten();
      foreach( $Collection as $key => $value )
         $Collection[$key]['dimension_id'] = $this->Dimension->find($Collection[$key]['dimension_id']);
         
      $data['query'] = $Collection;
      $data['heading'] = "Collection";

      $this->load->view('active_list_view', $data);
	}

	function create()
	{
      $formaction = 'collection/create';
      $formsubmit = 'create_collection';
	
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Collection->create($_POST['name'],$_POST['width'],$_POST['height']);
         redirect('/collection/');
      }
      else
      {
         $data['heading'] = 'Collection';
         $data['legend'] = 'Collection';
         $data['formaction'] = $formaction;
         $data['formsubmit'] = $formsubmit;

         $data['fields'] = array( new Field('name'), new Field('width'), new Field('height') );
         $this->load->view('active_create_full_view', $data);
      }
	}



	function view()
	{
	   $_id = $this->router->segments[3];
      $data['query'] = $this->Collection->find($_id);
      $data['heading'] = 'Collection';

      $InvolvedMedias = $this->Collection->involved_medias($_id);
      $data['query']['Involved medias'] = $InvolvedMedias;

      $this->load->view('active_view_view', $data);
	}
	
	

	function edit()
	{
	   $_layout_submit = 'submit_layout_to_collection';
      $_formaction = 'collection/edit';
      $_formsubmit = 'edit_collection';
      $_collection_layouts = 'Collection layouts';

		$_POST['id'] = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset($this->router->segments[4])
          && isset($this->router->segments[5])
          && $this->router->segments[4].$this->router->segments[5] == 'removelayout' )
      {
         $this->Collection->remove_layout($this->router->segments[3], $this->router->segments[6]);
      }
      else if( isset( $_POST[$_formsubmit] ) )
      {
         $this->Collection->save($_POST);
         //print_r($_POST); die();
         redirect('/collection/');
      }
      else if( isset( $_POST[$_layout_submit] ) )
      {
         $this->Collection->add_layout();
      }
      
      $data['query'] = $this->Collection->find($_POST['id']);
      $data['heading'] = 'Collection';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-collection';
      $data['actions'][$_collection_layouts]['remove'] = 'remove/layout';

      $CollectionLayouts = $this->Collection->list_collection_layouts($_POST['id']);
      $data['query'][$_collection_layouts] = $CollectionLayouts;
      
      $Dimension = $this->Dimension->find($data['query']['dimension_id']);
      $data['objects']['dimension'][$Dimension['id']] = $Dimension['dimension_x'].'x'.$Dimension['dimension_y'];

      $_layouts_not_in_collection = $this->Collection->list_layouts_excl( $_POST['id'] );
      if( count( $_layouts_not_in_collection ) )
      {
         $ac_data['legend'] = 'Available layouts';
         $ac_data['formaction'] = $_formaction;
         $ac_data['formsubmit'] = $_layout_submit;
         $ac_data['submitlabel'] = 'Add layout';

         $ac_data['fields'] = array(
            new Field( 'id', 'hidden', $_POST['id'] ),
            new Field( 'layout_id', $_layouts_not_in_collection ),
            new Field( 'frequency' ), 
            new Field( 'appearances' ), 
            new Field( 'importance' ), 
            new Field( 'probability' ), 
            new Field( 'valid_from_date', 'date' ), 
            new Field( 'valid_to_date', 'date' )
         );
         $data['views']['active_create_view']['data'] =& $ac_data;
      }
      $this->load->view('active_edit_view', $data);
	}



	function delete()
	{
      $this->Collection->delete($this->router->segments[3]);
      redirect('/collection/');
	}

}
?>
