<?
class Media_model extends Model {
    
    function __construct()
    {
        parent::Model();
        $this->load->model('Dimension_model','Dimension',TRUE);
        $this->load->model('Bundle_model','Bundle',TRUE);
    }
    function find($id)
    {
        $this->db->where('id='.$id);
        $query = $this->db->get( 'medias' );
        return $query->row_array();
    }
    function delete($id)
    {
        $this->Bundle->remove_media($id);
        $this->db->where('id='.$id);
        $this->db->delete( 'medias' );
    }
    function get_last_ten()
    {
        return $this->db->get('medias')->result_array();
    }
    
    function create($filename,$width,$height,$class,$length)
    {
        $Dimension = $this->Dimension->createfind($width,$height);
        return $this->insert($name,$Dimension['id'],$class,$length);
    }
    function insert($name,$dimension_id,$class,$length)
    {
        $Media['dimension_id'] = $dimension_id;
        $Media['name'] = $name;
        $this->db->where($Media);
        $query = $this->db->get('medias');
        if( $query->num_rows() == 1 )
        {
            return $query->row_array();
        }
        $Media['class'] = $class;
        $Media['length'] = $length;
        $this->db->insert( 'medias', $Media );
        $Media['id'] = $this->db->insert_id();
        return $Media;
    }
}
?>
