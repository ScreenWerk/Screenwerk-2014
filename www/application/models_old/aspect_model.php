<?
class Aspect_model extends Model {
    
    function __construct()
    {
        parent::Model();
    }

    function find($id)
    {
        $this->db->where('id='.$id);
        $query = $this->db->get( 'aspects' );
        return $query->row_array();
    }
    function delete($id)
    {
        $this->db->where('id='.$id);
        $this->db->delete( 'aspects' );
    }
    function find_all()
    {
        $query = $this->db->get('aspects');
        return $query->result_array();
    }
    function bestfit($x,$y)
    {
      $query = $this->db->query( 'SELECT ratio FROM ( SELECT *, ('.$x.'/'.$y.')/ratio + ratio/('.$x.'/'.$y.') rrr
            FROM sw_aspects s order by rrr LIMIT 0,1 ) r' );
      return current(current($query->result_array()));
    }
    
    
    function create($name,$ratio,$description=null)
    {
      $this->insert($name,$ratio,$description);
    }
    function insert($name,$ratio,$description=null)
    {
        $Aspect['ratio'] = $ratio;
        $this->db->where($Aspect);
        $query = $this->db->get('aspects');
        if( $query->num_rows() == 1 )
        {
            return $query->row_array();
        }
        $Aspect['name'] = $name;
        $Aspect['description'] = $description;
        $this->db->insert('aspects', $Aspect);
        $Aspect['id'] = $this->db->insert_id();
        return $Aspect;
    }
}
?>
