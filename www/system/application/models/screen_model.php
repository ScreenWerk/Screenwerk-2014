<?
class Screen_model extends Model {
    
    function __construct()
    {
        parent::Model();
        $this->load->model('Dimension_model','Dimension',TRUE);
        $this->load->model('Schedule_model','Schedule',TRUE);
    }
    
    
    
    function find($id)
    {
        $this->db->where('id='.$id);
        $query = $this->db->get( 'screens' );
        return $query->row_array();
    }
    
    
    
   function involved_medias($id)
   {
      $Screen = $this->find($id);
      return $this->Schedule->involved_medias($Screen['schedule_id']);
   }      
    
    
    
    function delete($id)
    {
        $this->db->where('id='.$id);
        $this->db->delete( 'screens' );
    }



    function get_last_ten()
    {
        $query = $this->db->get('screens', 10);
        return $query->result_array();
    }

    
    
    function update_name()
    {
        $row->name   = $_POST['name'];
        $this->db->update('screens', $row, array('id', $_POST['id']));
    }



    function update_schedule()
    {
        $row['schedule_id']   = $_POST['schedule_id'];
        $this->db->update('screens', $row, array('id', $_POST['id']));
    }



    function create($name,$width,$height)
    {
        $Dimension = $this->Dimension->createfind($width,$height);
        return $this->insert($name,$Dimension['id']);
    }



    function insert($name,$dimension_id)
    {
        $Screen['name'] = $name;
        $Screen['dimension_id'] = $dimension_id;
        $this->db->where($Screen);
        $query = $this->db->get('screens');
        if( $query->num_rows() == 1 )
        {
            return $query->row_array();
        }
        $this->db->insert('screens', $Screen);
        $Screen['id'] = $this->db->insert_id();
        return $Screen;
    }



    function save($Screen)
    {
        $Dimension = $this->Dimension->createfind($Screen['width'],$Screen['height']);
        //print_r(array("D"=>$Dimension,"S"=>$Screen));die();
        return $this->update($Screen['id'],$Screen['schedule_id'],$Screen['name'],$Dimension['id']);
    }



    function update($id,$schedule_id,$name,$dimension_id)
    {
        $Screen['id'] = $id;
        $this->db->where($Screen);
        $Screen['name'] = $name;
        $Screen['schedule_id'] = $schedule_id;
        $Screen['dimension_id'] = $dimension_id;
        $this->db->update('screens',$Screen);
    }

}
?>
