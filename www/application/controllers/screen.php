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

class Screen extends Controller {
   var $models = array(
            'Screen', 
            'Dimension', 
            'Schedule',
            'Playlist'
         );

	function __construct() {
		parent::Controller();
		$this->output->enable_profiler(TRUE);      
		$this->load->model('Screen_model', 'Screen');

		//$this->load->model('Form_model','Form',TRUE);
		//$this->data['menuitems'] = $this->Form->get_user_forms(1);
	}



	function index()
	{
      $Screen = $this->Screen->get_last_ten();
      foreach( $Screen as $key => $value )
      {
         //$Screen[$key]['dimension_id'] = $this->Dimension->find($Screen[$key]['dimension_id']);
         //$Screen[$key]['schedule_id'] = $this->Schedule->find($Screen[$key]['schedule_id']);
      }
      $data['query'] = $Screen;
      $data['heading'] = "Screen";

      $this->load->view('active_list_view', $data);
	}



	function create()
	{
      $formaction = 'screen/create';
      $formsubmit = 'create_screen';
	
      if( isset( $_POST[$formsubmit] ) )
      {
         $this->Screen->create($_POST['name'],$_POST['width'],$_POST['height']);
         redirect('/screen/');
      }
      else
      {
         $data['heading'] = 'Screen';
         $data['legend'] = 'Screen';
         $data['formaction'] = $formaction;
         $data['formsubmit'] = $formsubmit;

         $data['fields'] = array( new Field('name'), new Field('width'), new Field('height') );
         $this->load->view('active_create_full_view', $data);
      }
	}



	function view()
	{
	   $_id = $this->router->segments[3];
      $data['query'] = $this->Screen->find($_id);
      $data['heading'] = 'Screen';

      $InvolvedMedias = $this->Screen->involved_medias($_id);
      $data['query']['Involved medias'] = $InvolvedMedias;
      
      $data['anchors'][] = array( 'link' => 'playlist/create_playlist/'.$_id.'/5', 'label' => 'Create 5-day playlist' );
      $data['anchors'][] = array( 'link' => 'playlist/create_playlist/'.$_id.'/10', 'label' => 'Create 10-day playlist' );
      $this->load->view('active_view_view', $data);
	}



/* obsolete - functionality now in playlist controller
 *
	function create_playlist()
	{
	   $screen_id = $this->router->segments[3];
	   $no_of_days = $this->router->segments[4];
	   $pl_events = $this->Playlist->create_playlist_for_screen($screen_id, $no_of_days);
      #print_r($pl_dates);
      #die();

#      foreach( $pl_events as $date => $pl_date )
#         $data['query']['Playlist for ' . $date ] = $pl_date;
      $data['query']['Playlist'] = $pl_events;
      $data['heading'] = 'Screen';
      
      $data['anchors'][] = array( 'link' => 'screen/create_playlist/'.$screen_id.'/5', 'label' => 'Create 5-day playlist' );
      $data['anchors'][] = array( 'link' => 'screen/create_playlist/'.$screen_id.'/10', 'label' => 'Create 10-day playlist' );
      $this->load->view('active_view_view', $data);
	}
*/


	function edit()
	{
      $_formaction = 'screen/edit';
      $_formsubmit = 'edit_screen';

		$_POST['id'] = (isset($_POST['id'])) ? $_POST['id'] : $this->router->segments[3];

      if( isset( $_POST['id'] ) && isset( $_POST['schedule_id'] ) && isset( $_POST['name'] )
         && isset( $_POST['width'] ) && isset( $_POST['height'] ) )
      {
         $this->Screen->save($_POST);
         //print_r($_POST); die();
         redirect('/screen/');
      }

      $data['query'] = $this->Screen->find($_POST['id']);
      $data['heading'] = 'Screen';
      $data['formaction'] = $_formaction;
      $data['formsubmit'] = $_formsubmit;
      $data['submitlabel'] = 'submit-da-screen';
         
      $Dimension = $this->Dimension->find($data['query']['dimension_id']);
      $data['objects']['dimension'][$Dimension['id']] = $Dimension['dimension_x'].'x'.$Dimension['dimension_y'];
      foreach( $this->Schedule->find_by_dimension($data['query']['dimension_id']) as $_schedule )
      {
         $data['objects']['schedule'][$_schedule['id']] = $_schedule['name'];
      }
      $data['query']['width'] = $Dimension['dimension_x'];
      $data['query']['height'] = $Dimension['dimension_y'];
      $data['heading'] = 'Screen';
      $this->load->view('active_edit_view', $data);
	}

	function delete()
	{
      $this->Screen->delete($this->router->segments[3]);
      redirect('/screen/');
	}

}
?>
