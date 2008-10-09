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

class Schedule extends Controller 
{
   var $models = array(
            'left' => 'Collection', 
            'right' => 'Schedule', 
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
      $Schedule = $this->Schedule->find_all();
      foreach( $Schedule as $key => $value )
         $Schedule[$key]['dimension_id'] = $this->Dimension->find($Schedule[$key]['dimension_id']);
      
      $data['query'] = $Schedule;
      $data['heading'] = "Schedule";

      $this->load->view('active_list_view', $data);
	}



	function create()
	{
      $formaction = 'schedule/create';
      $formsubmit = 'create_schedule';
	
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Schedule->create($_POST['name'],$_POST['width'],$_POST['height']);
         redirect('/schedule/');
      }
      else
      {
         $data['heading'] = 'Schedule';
         $data['legend'] = 'Schedule';
         $data['formaction'] = $formaction;
         $data['formsubmit'] = $formsubmit;

         $data['fields'] = array( new Field('name'), new Field('width'), new Field('height') );
         $this->load->view('active_create_full_view', $data);
      }
	}



	function view()
	{
	   $_id = $this->router->segments[3];
      $data['query'] = $this->Schedule->find($_id);
      $data['heading'] = 'Schedule';

      $InvolvedMedias = $this->Schedule->involved_medias($_id);
      $data['query']['Involved medias'] = $InvolvedMedias;
      
      $this->load->view('active_view_view', $data);
	}



	function edit()
	{
	   $_collection_submit = 'submit_collection_to_schedule';
      $_formaction = 'schedule/edit';
      $_formsubmit = 'edit_schedule';
      $_schedule_collections = 'Schedule collections';

		$_s_id = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset($this->router->segments[4])
          && isset($this->router->segments[5])
          && $this->router->segments[4].$this->router->segments[5] == 'removecollection' )
      {
         $this->Schedule->remove_collection($this->router->segments[6]);
      }
      else if( isset( $_POST[$_formsubmit] ) )
      {
         $this->Schedule->save($_POST);
         redirect('/schedule/');
      }
      else if( isset( $_POST[$_collection_submit] ) )
      {
         $this->Schedule->add_collection();
      }
      
      $data['query'] = $this->Schedule->find($_s_id);
      $data['heading'] = 'Schedule';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-schedule';
      $data['actions'][$_schedule_collections]['remove'] = 'remove/collection';

      $ScheduleCollections = $this->Schedule->list_schedule_collections($_s_id);
      $data['query'][$_schedule_collections] = $ScheduleCollections;
      
      $Dimension = $this->Dimension->find($data['query']['dimension_id']);
      $data['objects']['dimension'][$Dimension['id']] = $Dimension['dimension_x'].'x'.$Dimension['dimension_y'];

      $_collections_not_in_schedule = $this->Schedule->list_suitable_collections( $_s_id );
      if( count( $_collections_not_in_schedule ) )
      {
         $ac_data['legend'] = 'Available collections';
         $ac_data['formaction'] = $_formaction;
         $ac_data['formsubmit'] = $_collection_submit;
         $ac_data['submitlabel'] = 'Add collection';

         $ac_data['fields'] = array(
            new Field( 'id', 'hidden', $_s_id ),
            new Field( 'collection_id', $_collections_not_in_schedule ),
            new Field( 'cron_minute' ), 
            new Field( 'cron_hour' ), 
            new Field( 'cron_day' ), 
            new Field( 'cron_month' ), 
            new Field( 'cron_weekday' ), 
            new Field( 'valid_from_date', 'date' ), 
            new Field( 'valid_to_date', 'date' )
         );
         $data['views']['active_create_view']['data'] =& $ac_data;
      }
      $this->load->view('active_edit_view', $data);
	}



	function delete()
	{
      $data['query'] = $this->Schedule->delete($this->router->segments[3]);
      redirect('/schedule/');
	}
}
?>
